// filepath: c:\Users\yavuz\OneDrive\Masaüstü\Longhorn\lethrinus-dashboard\components\Journal.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { JournalEntry, AccentColor } from '../types';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Smile,
  Frown,
  Meh,
  Briefcase,
  Coffee,
  Image as ImageIcon,
  X,
  Music,
  Calendar,
  BookOpen,
  Sparkles,
  List,
  Search,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { SpotlightCard, FadeIn, CardHover, Skeleton, ModalWrapper, GlassCard } from './Animations';

interface JournalProps {
  accent: AccentColor;
}

const moodConfig = {
  happy: { icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500' },
  productive: { icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500' },
  neutral: { icon: Meh, color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500' },
  tired: { icon: Coffee, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500' },
  sad: { icon: Frown, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500' },
};

const MoodButton: React.FC<{
  mood: keyof typeof moodConfig;
  active: boolean;
  onClick: () => void;
}> = ({ mood, active, onClick }) => {
  const config = moodConfig[mood];
  const Icon = config.icon;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`
        p-2.5 rounded-xl transition-all border
        ${active
          ? `${config.bg} ${config.border} ${config.color}`
          : 'bg-black/20 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={mood}
    >
      <Icon size={20} />
    </motion.button>
  );
};

export const Journal: React.FC<JournalProps> = ({ accent }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activeEntry, setActiveEntry] = useState<Partial<JournalEntry>>({
    title: '',
    content: '',
    mood: 'neutral',
    tags: [],
    images: [],
    spotifyEmbed: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSpotifyInput, setShowSpotifyInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showEntriesList, setShowEntriesList] = useState(false);
  const [entriesSearchTerm, setEntriesSearchTerm] = useState('');
  const [isTypingSpotify, setIsTypingSpotify] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spotifyInputRef = useRef<HTMLInputElement>(null);

  // Load entries on mount
  useEffect(() => {
    loadEntries();
    
    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update active entry when selected date or entries change
  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existing = entries.find(e => e.date === dateStr);

    if (existing) {
      // Load existing entry with all its data
      setActiveEntry({
        id: existing.id,
        date: existing.date,
        title: existing.title || '',
        content: existing.content || '',
        mood: existing.mood || 'neutral',
        tags: existing.tags || [],
        images: existing.images || [],
        spotifyEmbed: existing.spotifyEmbed || '',
        createdAt: existing.createdAt,
      });
      setShowSpotifyInput(!!existing.spotifyEmbed);
    } else {
      // Create new blank entry for this date
      setActiveEntry({
        date: dateStr,
        title: '',
        content: '',
        mood: 'neutral',
        tags: [],
        images: [],
        spotifyEmbed: '',
      });
      setShowSpotifyInput(false);
    }
    setSaveStatus('idle');
    setErrorMessage(null);
  }, [selectedDate, entries]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await api.getJournalEntries();
      setEntries(data);
    } catch (error) {
      console.error('Failed to load journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSave = async (isManual: boolean) => {
    if (isManual) {
      setIsSaving(true);
    }
    setSaveStatus('saving');
    setErrorMessage(null);

    let embedUrl = activeEntry.spotifyEmbed || '';
    if (embedUrl && embedUrl.includes('open.spotify.com') && !embedUrl.includes('/embed')) {
      embedUrl = embedUrl.replace('.com/', '.com/embed/');
    }

    const entryToSave: JournalEntry = {
      id: activeEntry.id || Math.random().toString(36).substr(2, 9),
      date: activeEntry.date || format(selectedDate, 'yyyy-MM-dd'),
      title: activeEntry.title || '',
      content: activeEntry.content || '',
      mood: (activeEntry.mood || 'neutral') as JournalEntry['mood'],
      tags: activeEntry.tags || [],
      images: activeEntry.images || [],
      spotifyEmbed: embedUrl,
      createdAt: activeEntry.createdAt || Date.now(),
    };

    try {
      const savedEntry = await api.saveJournalEntry(entryToSave);
      // Update local entries with the saved entry
      setEntries(prev => {
        const existingIndex = prev.findIndex(e => e.date === savedEntry.date);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = savedEntry;
          return updated;
        }
        return [savedEntry, ...prev];
      });
      // Update active entry with saved data (including new ID from server)
      setActiveEntry(savedEntry);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: any) {
      console.error('Failed to save entry:', error);
      setSaveStatus('error');
      setErrorMessage(error?.message || 'Failed to save entry. Please try again.');
      setTimeout(() => {
        setSaveStatus('idle');
        setErrorMessage(null);
      }, 5000);
    } finally {
      if (isManual) {
        setIsSaving(false);
      }
    }
  };

  // Auto-save functionality with debounce
  useEffect(() => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't auto-save if entry is empty
    if (!activeEntry.content && !activeEntry.title) {
      return;
    }

    // Don't auto-save if manual save is in progress
    if (isSaving) {
      return;
    }

    // Don't auto-save if user is typing in Spotify input
    if (isTypingSpotify) {
      return;
    }

    // Set up auto-save after 3 seconds of inactivity (increased from 2)
    saveTimeoutRef.current = setTimeout(() => {
      performSave(false);
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEntry.content, activeEntry.title, activeEntry.mood, activeEntry.tags, activeEntry.images, activeEntry.spotifyEmbed, isSaving, isTypingSpotify]);

  const handleSave = async () => {
    if (!activeEntry.content && !activeEntry.title) {
      setErrorMessage('Please add some content before saving');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    await performSave(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setActiveEntry(prev => ({
          ...prev,
          images: [...(prev.images || []), base64String],
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setActiveEntry(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      setDeletingEntryId(entryId);
      await api.deleteJournalEntry(entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));
      setShowDeleteConfirm(null);
      
      // If deleted entry was active, clear it
      if (activeEntry.id === entryId) {
        setActiveEntry({
          title: '',
          content: '',
          mood: 'neutral',
          tags: [],
          images: [],
          spotifyEmbed: '',
        });
      }
    } catch (error: any) {
      console.error('Failed to delete entry:', error);
      setErrorMessage(error?.message || 'Failed to delete entry');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setDeletingEntryId(null);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = getDay(startOfMonth(currentMonth));

  return (
    <div className="flex h-full flex-col md:flex-row overflow-hidden bg-[#050505]">
      {/* Sidebar Calendar */}
      <motion.div
        className="w-full md:w-80 bg-[#0a0a0c] border-r border-white/5 flex flex-col"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Month Navigation */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <motion.button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={20} />
          </motion.button>
          <h2 className="font-bold text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
          <motion.button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="text-xs font-medium text-slate-600">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day, index) => {
              const hasEntry = entries.some(e => e.date === format(day, 'yyyy-MM-dd'));
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <motion.button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`
                    h-9 w-9 rounded-lg flex items-center justify-center text-sm relative transition-all
                    ${isSelected
                      ? 'bg-violet-600 text-white font-bold shadow-lg shadow-violet-500/30'
                      : isTodayDate
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {format(day, 'd')}
                  {hasEntry && !isSelected && (
                    <motion.div
                      className="absolute bottom-1 w-1 h-1 rounded-full bg-violet-500"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="p-4 mt-auto border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {entries.length} entries
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(selectedDate, 'MMM d')}
            </span>
          </div>
          <motion.button
            onClick={() => setShowEntriesList(true)}
            className="w-full py-2 px-3 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-400 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <List size={14} />
            View All Entries
          </motion.button>
        </div>
      </motion.div>

      {/* Main Editor */}
      <motion.div
        className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0a0c] relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />

        {/* Header */}
        <motion.header
          className="p-4 md:p-6 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between z-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {format(selectedDate, 'EEEE, MMMM do')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isToday(selectedDate) ? "Today's Entry" : 'Past Entry'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Save Status Indicator */}
            <AnimatePresence mode="wait">
              {saveStatus === 'saving' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs text-slate-400"
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-violet-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span>Saving...</span>
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs text-emerald-400"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-emerald-500"
                  />
                  <span>Saved</span>
                </motion.div>
              )}
              {saveStatus === 'error' && errorMessage && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs text-red-400 max-w-xs"
                  title={errorMessage}
                >
                  <X size={12} />
                  <span className="truncate">Save failed</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-xl hover:from-violet-500 hover:to-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 font-bold text-xs uppercase tracking-wide"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Entry'}
            </motion.button>
          </div>
        </motion.header>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full z-10 custom-scrollbar">
          {/* Error Message Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400"
              >
                <X size={16} />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* Title Input */}
              <input
                type="text"
                placeholder="Title (optional)"
                value={activeEntry.title || ''}
                onChange={e => setActiveEntry({ ...activeEntry, title: e.target.value })}
                className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 placeholder-slate-700 text-white mb-6 p-0 outline-none"
              />

              {/* Mood & Actions Row */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex gap-2">
                  {(Object.keys(moodConfig) as Array<keyof typeof moodConfig>).map(mood => (
                    <MoodButton
                      key={mood}
                      mood={mood}
                      active={activeEntry.mood === mood}
                      onClick={() => setActiveEntry({ ...activeEntry, mood })}
                    />
                  ))}
                </div>

                <div className="h-8 w-[1px] bg-white/10" />

                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition-all text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ImageIcon size={16} /> Add Image
                </motion.button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />

                <motion.button
                  onClick={() => setShowSpotifyInput(!showSpotifyInput)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 border transition-all text-sm font-medium ${
                    showSpotifyInput
                      ? 'text-green-400 border-green-500/30'
                      : 'border-white/10 text-slate-400 hover:text-green-400 hover:border-green-500/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Music size={16} /> Add Music
                </motion.button>
              </div>

              {/* Spotify Input */}
              <AnimatePresence>
                {showSpotifyInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="p-4 rounded-xl bg-black/30 border border-green-500/20">
                      <div className="mb-2 text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                        <Music size={12} /> Spotify Integration
                      </div>
                      <input
                        ref={spotifyInputRef}
                        type="text"
                        placeholder="Paste Spotify Song or Playlist Link"
                        value={activeEntry.spotifyEmbed || ''}
                        onFocus={() => setIsTypingSpotify(true)}
                        onBlur={() => {
                          // Delay to allow paste operations
                          setTimeout(() => setIsTypingSpotify(false), 500);
                        }}
                        onChange={e => {
                          setActiveEntry({ ...activeEntry, spotifyEmbed: e.target.value });
                          setIsTypingSpotify(true);
                          // Reset typing flag after user stops typing
                          if (saveTimeoutRef.current) {
                            clearTimeout(saveTimeoutRef.current);
                          }
                          saveTimeoutRef.current = setTimeout(() => {
                            setIsTypingSpotify(false);
                          }, 2000);
                        }}
                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-sm outline-none focus:border-green-500/50"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spotify Embed Preview */}
              <AnimatePresence>
                {activeEntry.spotifyEmbed &&
                  typeof activeEntry.spotifyEmbed === 'string' &&
                  activeEntry.spotifyEmbed.includes('spotify.com') && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mb-6 rounded-xl overflow-hidden shadow-lg border border-white/5 bg-black/40"
                    >
                      <iframe
                        style={{ borderRadius: '12px' }}
                        src={activeEntry.spotifyEmbed.replace('.com/', '.com/embed/')}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      />
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* Image Grid */}
              <AnimatePresence>
                {activeEntry.images && activeEntry.images.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6"
                  >
                    {activeEntry.images.map((img, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative group rounded-xl overflow-hidden aspect-video border border-white/10 shadow-lg bg-black/50"
                      >
                        <img
                          src={img}
                          alt="Journal"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <motion.button
                            onClick={() => removeImage(idx)}
                            className="p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Textarea */}
              <textarea
                placeholder="Write about your day..."
                value={activeEntry.content || ''}
                onChange={e => setActiveEntry({ ...activeEntry, content: e.target.value })}
                className="w-full min-h-[400px] resize-none bg-transparent border-none focus:ring-0 text-lg leading-relaxed text-slate-300 placeholder-slate-700 p-0 outline-none"
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Entries List Modal */}
      <ModalWrapper isOpen={showEntriesList} onClose={() => setShowEntriesList(false)}>
        <GlassCard className="w-full max-w-2xl max-h-[80vh] flex flex-col" blur={20} opacity={0.1}>
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen size={20} />
                All Journal Entries
              </h2>
              <motion.button
                onClick={() => setShowEntriesList(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search entries..."
                value={entriesSearchTerm}
                onChange={e => setEntriesSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <AnimatePresence mode="popLayout">
              {entries
                .filter(entry => {
                  if (!entriesSearchTerm) return true;
                  const search = entriesSearchTerm.toLowerCase();
                  return (
                    entry.title?.toLowerCase().includes(search) ||
                    entry.content?.toLowerCase().includes(search) ||
                    entry.date.includes(search)
                  );
                })
                .map((entry, index) => {
                const entryDate = new Date(entry.date);
                const isSelected = isSameDay(entryDate, selectedDate);
                const MoodIcon = moodConfig[entry.mood]?.icon || Meh;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      p-4 rounded-xl border mb-3 transition-all group relative
                      ${isSelected
                        ? 'bg-violet-500/10 border-violet-500/30'
                        : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'
                      }
                      ${deletingEntryId === entry.id ? 'opacity-50 pointer-events-none' : ''}
                    `}
                    whileHover={{ scale: 1.02, x: 4 }}
                  >
                    <div 
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedDate(entryDate);
                        setShowEntriesList(false);
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <MoodIcon size={16} className={moodConfig[entry.mood]?.color || 'text-slate-400'} />
                            <h3 className="font-bold text-white truncate">
                              {entry.title || 'Untitled Entry'}
                            </h3>
                          </div>
                          <p className="text-sm text-slate-400 line-clamp-2 mb-2">
                            {entry.content || 'No content'}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {format(entryDate, 'MMM d, yyyy')}
                            </span>
                            {entry.tags && entry.tags.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Sparkles size={12} />
                                {entry.tags.length} tags
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-violet-500"
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Delete Button with Animation */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(entry.id);
                      }}
                      className="absolute top-3 right-3 p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: showDeleteConfirm === entry.id ? 1 : 0, scale: 1 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>

                    {/* Delete Confirmation */}
                    <AnimatePresence>
                      {showDeleteConfirm === entry.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute inset-0 bg-red-500/10 border-2 border-red-500/30 rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm z-20"
                        >
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEntry(entry.id);
                              }}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm flex items-center gap-2"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {deletingEntryId === entry.id ? (
                                <>
                                  <motion.div
                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  />
                                  <span>Deleting...</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 size={14} />
                                  <span>Delete</span>
                                </>
                              )}
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(null);
                              }}
                              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium text-sm"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {entries.filter(entry => {
              if (!entriesSearchTerm) return true;
              const search = entriesSearchTerm.toLowerCase();
              return (
                entry.title?.toLowerCase().includes(search) ||
                entry.content?.toLowerCase().includes(search) ||
                entry.date.includes(search)
              );
            }).length === 0 && (
              <motion.div 
                className="text-center py-12 text-slate-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <BookOpen size={48} className="mx-auto mb-4 text-slate-700" />
                </motion.div>
                <p className="text-lg font-medium">No entries found</p>
                <p className="text-sm text-slate-600 mt-1">
                  {entriesSearchTerm ? 'Try a different search term' : 'Start writing your first entry!'}
                </p>
              </motion.div>
            )}
          </div>
        </GlassCard>
      </ModalWrapper>
    </div>
  );
};

