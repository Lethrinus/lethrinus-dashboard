import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MediaItem, AccentColor } from '../types';
import { Plus, Film, Tv, Star, Trash2, Check, Clock, Calendar, Eye, Search, X } from 'lucide-react';

interface MediaProps {
  accent: AccentColor;
}

export const Media: React.FC<MediaProps> = ({ accent }) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'watching' | 'completed' | 'plan'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New Media Form State
  const [newItem, setNewItem] = useState<Partial<MediaItem>>({
    title: '',
    type: 'movie',
    status: 'watching',
    rating: 0,
    year: new Date().getFullYear().toString(),
    image: ''
  });

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    const data = await api.getMedia();
    setItems(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title) return;

    const media: MediaItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: newItem.title,
      type: newItem.type || 'movie',
      status: newItem.status || 'plan',
      rating: newItem.rating || 0,
      year: newItem.year,
      image: newItem.image || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=500&q=60' // Default fallback
    };

    await api.saveMedia(media);
    setNewItem({ title: '', type: 'movie', status: 'watching', rating: 0, year: new Date().getFullYear().toString(), image: '' });
    setIsModalOpen(false);
    loadMedia();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Remove this item from your library?')) {
      await api.deleteMedia(id);
      loadMedia();
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'watching': return 'bg-emerald-500 text-white';
          case 'completed': return 'bg-blue-500 text-white';
          case 'plan': return 'bg-slate-500 text-slate-200';
          default: return 'bg-slate-500';
      }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
        case 'watching': return 'Watching';
        case 'completed': return 'Completed';
        case 'plan': return 'Plan to Watch';
        default: return status;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <Film className={`text-${accent}-500`} size={24} />
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-sans">Entertainment Hub</h1>
           </div>
           <p className="text-slate-500 dark:text-slate-400 text-sm">Track your movies, series, and watchlist.</p>
        </div>

        <div className="flex items-center gap-4">
             {/* Search */}
             <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search library..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
                />
             </div>
             
             <button 
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center gap-2 px-5 py-2.5 bg-${accent}-600 text-white rounded-xl hover:bg-${accent}-700 shadow-lg shadow-${accent}-500/30 transition-all font-bold tracking-wide uppercase text-xs`}
            >
                <Plus size={16} /> Add New
            </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'watching', 'plan', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`
                    px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                    ${filter === f 
                        ? `bg-${accent}-500 text-white shadow-lg shadow-${accent}-500/25` 
                        : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}
                `}
              >
                  {f === 'all' ? 'All Media' : getStatusLabel(f)}
              </button>
          ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredItems.map(item => (
            <div key={item.id} className="group relative bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1">
                {/* Poster Image */}
                <div className="aspect-[2/3] w-full relative overflow-hidden bg-slate-800">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    
                    {/* Floating Status Badge */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                    </div>
                    
                    {/* Delete Button (Hover) */}
                    <button 
                        onClick={(e) => handleDelete(e, item.id)}
                        className="absolute top-3 left-3 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 relative">
                    {/* Type & Year */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <span className="flex items-center gap-1 uppercase">
                            {item.type === 'movie' ? <Film size={10} /> : <Tv size={10} />} {item.type}
                        </span>
                        <span>{item.year}</span>
                    </div>

                    <h3 className="text-white font-bold leading-tight mb-2 truncate" title={item.title}>{item.title}</h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                                key={star} 
                                size={12} 
                                className={`${star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
          <div className="py-20 text-center">
              <Film size={48} className={`mx-auto mb-4 text-${accent}-500/20`} />
              <p className="text-slate-500">No media found in this category.</p>
          </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Add to Library</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="Movie or Show Title"
                            value={newItem.title}
                            onChange={e => setNewItem({...newItem, title: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Type</label>
                            <select 
                                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white outline-none"
                                value={newItem.type}
                                onChange={e => setNewItem({...newItem, type: e.target.value as any})}
                            >
                                <option value="movie">Movie</option>
                                <option value="series">TV Series</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Year</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white outline-none"
                                placeholder="2024"
                                value={newItem.year}
                                onChange={e => setNewItem({...newItem, year: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Poster URL</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-xs outline-none font-mono"
                            placeholder="https://..."
                            value={newItem.image}
                            onChange={e => setNewItem({...newItem, image: e.target.value})}
                        />
                        <p className="text-[10px] text-slate-600 mt-1">Paste an image link from IMDb or TMDb.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
                            <select 
                                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white outline-none"
                                value={newItem.status}
                                onChange={e => setNewItem({...newItem, status: e.target.value as any})}
                            >
                                <option value="watching">Watching</option>
                                <option value="plan">Plan to Watch</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Rating (0-5)</label>
                            <input 
                                type="number" 
                                min="0" max="5"
                                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white outline-none"
                                value={newItem.rating}
                                onChange={e => setNewItem({...newItem, rating: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>

                    <button type="submit" className={`w-full py-3 mt-4 bg-${accent}-600 hover:bg-${accent}-700 text-white font-bold uppercase tracking-wider rounded-xl transition-colors`}>
                        Add Item
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};