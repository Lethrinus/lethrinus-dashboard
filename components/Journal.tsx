import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { JournalEntry, AccentColor } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Save, Smile, Frown, Meh, Briefcase, Coffee, Image as ImageIcon, X, Music } from 'lucide-react';

interface JournalProps {
  accent: AccentColor;
}

const MoodIcon = ({ mood, active }: { mood: string; active: boolean }) => {
  const size = 20;
  const className = active ? 'text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200';
  
  switch (mood) {
    case 'happy': return <Smile size={size} className={className} />;
    case 'sad': return <Frown size={size} className={className} />;
    case 'neutral': return <Meh size={size} className={className} />;
    case 'productive': return <Briefcase size={size} className={className} />;
    case 'tired': return <Coffee size={size} className={className} />;
    default: return <Meh size={size} className={className} />;
  }
};

export const Journal: React.FC<JournalProps> = ({ accent }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activeEntry, setActiveEntry] = useState<Partial<JournalEntry>>({ title: '', content: '', mood: 'neutral', tags: [], images: [], spotifyEmbed: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [showSpotifyInput, setShowSpotifyInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existing = entries.find(e => e.date === dateStr);
    if (existing) {
      setActiveEntry(existing);
      setShowSpotifyInput(!!existing.spotifyEmbed);
    } else {
      setActiveEntry({
        date: dateStr,
        title: '',
        content: '',
        mood: 'neutral',
        tags: [],
        images: [],
        spotifyEmbed: ''
      });
      setShowSpotifyInput(false);
    }
  }, [selectedDate, entries]);

  const loadEntries = async () => {
    const data = await api.getJournalEntries();
    setEntries(data);
  };

  const handleSave = async () => {
    if (!activeEntry.content && !activeEntry.title) return;
    setIsSaving(true);
    
    // Convert normal spotify links to embed if needed
    let embedUrl = activeEntry.spotifyEmbed || '';
    if (embedUrl && embedUrl.includes('open.spotify.com') && !embedUrl.includes('/embed')) {
      embedUrl = embedUrl.replace('.com/', '.com/embed/');
    }

    const entryToSave: JournalEntry = {
      id: activeEntry.id || Math.random().toString(36).substr(2, 9),
      date: activeEntry.date || format(selectedDate, 'yyyy-MM-dd'),
      title: activeEntry.title || '',
      content: activeEntry.content || '',
      mood: (activeEntry.mood || 'neutral') as any,
      tags: activeEntry.tags || [],
      images: activeEntry.images || [],
      spotifyEmbed: embedUrl,
      createdAt: activeEntry.createdAt || Date.now()
    };

    await api.saveJournalEntry(entryToSave);
    await loadEntries();
    setIsSaving(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setActiveEntry(prev => ({
          ...prev,
          images: [...(prev.images || []), base64String]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setActiveEntry(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = getDay(startOfMonth(currentMonth)); 

  return (
    <div className="flex h-full flex-col md:flex-row overflow-hidden">
      {/* Sidebar Calendar */}
      <div className="w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
            <ChevronLeft size={20} className="text-slate-500" />
          </button>
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
            <ChevronRight size={20} className="text-slate-500" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <span key={d} className="text-xs font-medium text-slate-400">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => {
              const hasEntry = entries.some(e => e.date === format(day, 'yyyy-MM-dd'));
              const isSelected = isSameDay(day, selectedDate);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    h-8 w-8 rounded-full flex items-center justify-center text-sm relative transition-colors
                    ${isSelected ? `bg-${accent}-600 text-white font-semibold` : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}
                  `}
                >
                  {format(day, 'd')}
                  {hasEntry && !isSelected && (
                    <div className={`absolute bottom-1 w-1 h-1 rounded-full bg-${accent}-500`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
           <p className="text-xs text-slate-500 text-center">
             {entries.length} entries total
           </p>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

        <header className="p-4 md:p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              {format(selectedDate, 'EEEE, MMMM do')}
            </h1>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`
              flex items-center gap-2 px-4 py-2 bg-${accent}-600 text-white rounded-lg hover:bg-${accent}-700 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-${accent}-500/20
            `}
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full z-10">
          <input 
            type="text" 
            placeholder="Title (optional)"
            value={activeEntry.title || ''}
            onChange={(e) => setActiveEntry({...activeEntry, title: e.target.value})}
            className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 placeholder-slate-300 dark:placeholder-slate-700 text-slate-900 dark:text-white mb-6 p-0"
          />

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex gap-2">
                {['happy', 'productive', 'neutral', 'tired', 'sad'].map((m) => (
                <button
                    key={m}
                    onClick={() => setActiveEntry({...activeEntry, mood: m as any})}
                    className={`
                    p-2 rounded-lg transition-colors border
                    ${activeEntry.mood === m 
                        ? `bg-${accent}-600 border-${accent}-600 text-white` 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'}
                    `}
                    title={m}
                >
                    <MoodIcon mood={m} active={activeEntry.mood === m} />
                </button>
                ))}
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

            <button 
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-${accent}-400 hover:border-${accent}-500/30 transition-all text-sm font-medium`}
            >
                <ImageIcon size={18} /> Add Image
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
            />

            <button 
                onClick={() => setShowSpotifyInput(!showSpotifyInput)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-green-500 hover:border-green-500/30 transition-all text-sm font-medium ${showSpotifyInput ? 'text-green-500 border-green-500/30' : ''}`}
            >
                <Music size={18} /> Add Music
            </button>
          </div>

          {/* Spotify Input */}
          {showSpotifyInput && (
             <div className="mb-6 p-4 rounded-xl bg-black/20 border border-white/5 animate-in slide-in-from-top-2">
                <div className="mb-2 text-xs font-bold text-green-500 uppercase tracking-wider flex items-center gap-2">
                   <Music size={12} /> Spotify Integration
                </div>
                <input 
                  type="text" 
                  placeholder="Paste Spotify Song or Playlist Link (e.g. https://open.spotify.com/track/...)"
                  value={activeEntry.spotifyEmbed || ''}
                  onChange={(e) => setActiveEntry({...activeEntry, spotifyEmbed: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-green-500/50"
                />
             </div>
          )}

          {/* Spotify Embed Preview */}
          {activeEntry.spotifyEmbed && typeof activeEntry.spotifyEmbed === 'string' && activeEntry.spotifyEmbed.includes('spotify.com') && (
             <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-white/5 bg-black/40">
                <iframe 
                  style={{ borderRadius: '12px' }} 
                  src={activeEntry.spotifyEmbed.replace('.com/', '.com/embed/')} 
                  width="100%" 
                  height="152" 
                  frameBorder="0" 
                  allowFullScreen 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                ></iframe>
             </div>
          )}

          {/* Image Grid */}
          {activeEntry.images && activeEntry.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {activeEntry.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-white/10 shadow-lg bg-black/50">
                        <img src={img} alt="Journal" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <button 
                                onClick={() => removeImage(idx)}
                                className="p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          )}

          <textarea
            placeholder="Write about your day..."
            value={activeEntry.content || ''}
            onChange={(e) => setActiveEntry({...activeEntry, content: e.target.value})}
            className="w-full h-[calc(100vh-500px)] resize-none bg-transparent border-none focus:ring-0 text-lg leading-relaxed text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-700 p-0"
          />
        </div>
      </div>
    </div>
  );
};