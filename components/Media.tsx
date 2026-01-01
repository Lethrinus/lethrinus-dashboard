// filepath: c:\Users\yavuz\OneDrive\Masaüstü\Longhorn\lethrinus-dashboard\components\Media.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { MediaItem, AccentColor } from '../types';
import { Plus, Film, Tv, Star, Trash2, Search, X, Clapperboard, Eye, Clock, CheckCircle } from 'lucide-react';
import { ModalWrapper, CardHover, Skeleton } from './Animations';

interface MediaProps {
  accent: AccentColor;
}

const statusConfig = {
  watching: { label: 'Watching', icon: Eye, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'bg-blue-500', textColor: 'text-blue-400' },
  plan: { label: 'Plan to Watch', icon: Clock, color: 'bg-slate-500', textColor: 'text-slate-400' },
};

export const Media: React.FC<MediaProps> = ({ accent }) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'watching' | 'completed' | 'plan'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [newItem, setNewItem] = useState<Partial<MediaItem>>({
    title: '',
    type: 'movie',
    status: 'watching',
    rating: 0,
    year: new Date().getFullYear().toString(),
    image: '',
  });

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const data = await api.getMedia();
      setItems(data);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
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
      image:
        newItem.image ||
        'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=500&q=60',
    };

    await api.saveMedia(media);
    setNewItem({
      title: '',
      type: 'movie',
      status: 'watching',
      rating: 0,
      year: new Date().getFullYear().toString(),
      image: '',
    });
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

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      className="p-6 lg:p-10 max-w-7xl mx-auto min-h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2.5 rounded-xl bg-white-500/20 text-white-400"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Clapperboard size={28} />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-white">Holodeck</h1>
            <p className="text-slate-500 text-sm">Track your movies and series</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <motion.div
            className="relative"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Search size={16} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl bg-[#131316] border border-white/10 text-white placeholder-slate-600 focus:ring-2 focus:ring-white-500/50 focus:border-white-500 outline-none w-full md:w-64 transition-all"
            />
          </motion.div>

          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-white-600 to-white-700 text-white rounded-xl hover:from-white-500 hover:to-white-600 shadow-lg shadow-white-500/25 transition-all font-bold tracking-wide uppercase text-xs"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Plus size={16} /> Add New
          </motion.button>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        className="flex gap-2 mb-8 overflow-x-auto pb-2"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {(['all', 'watching', 'plan', 'completed'] as const).map((f, index) => {
          const config = f !== 'all' ? statusConfig[f] : null;
          const Icon = config?.icon;

          return (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2
                ${filter === f
                  ? 'bg-white-500 text-white shadow-lg shadow-white-500/25'
                  : 'bg-[#131316] text-slate-500 border border-white/10 hover:bg-white/5 hover:text-white'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {Icon && <Icon size={12} />}
              {f === 'all' ? 'All Media' : config?.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const sConfig = statusConfig[item.status];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  className="group relative"
                  layout
                >
                  <CardHover className="bg-[#131316] rounded-2xl overflow-hidden border border-white/5 hover:border-white-500/30 h-full">
                    {/* Poster Image */}
                    <div className="aspect-[2/3] w-full relative overflow-hidden bg-slate-900">
                      <motion.img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                      {/* Status Badge */}
                      <motion.div
                        className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${sConfig.color} text-white shadow-sm`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.03 + 0.2 }}
                      >
                        {sConfig.label}
                      </motion.div>

                      {/* Delete Button */}
                      <motion.button
                        onClick={e => handleDelete(e, item.id)}
                        className="absolute top-3 left-3 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                        <span className="flex items-center gap-1 uppercase">
                          {item.type === 'movie' ? <Film size={10} /> : <Tv size={10} />}
                          {item.type}
                        </span>
                        <span>{item.year}</span>
                      </div>

                      <h3 className="text-white font-bold leading-tight mb-2 truncate" title={item.title}>
                        {item.title}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <motion.div
                            key={star}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: star * 0.05 }}
                          >
                            <Star
                              size={12}
                              className={`${
                                star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                              }`}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardHover>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <motion.div
          className="py-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Film size={64} className="mx-auto mb-4 text-slate-700" />
          </motion.div>
          <p className="text-slate-500 text-lg">No media found in this category</p>
          <p className="text-slate-600 text-sm mt-1">Add something to your collection!</p>
        </motion.div>
      )}

      {/* Add Modal */}
      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-[#131316] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clapperboard size={20} className="text-white-500" />
              Add to Library
            </h2>
            <motion.button
              onClick={() => setIsModalOpen(false)}
              className="text-slate-400 hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
          </div>

          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Title</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white focus:ring-1 focus:ring-white-500 outline-none transition-colors"
                placeholder="Movie or Show Title"
                value={newItem.title}
                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Type</label>
                <select
                  className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                  value={newItem.type}
                  onChange={e => setNewItem({ ...newItem, type: e.target.value as 'movie' | 'series' })}
                >
                  <option value="movie">Movie</option>
                  <option value="series">TV Series</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Year</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                  placeholder="2024"
                  value={newItem.year}
                  onChange={e => setNewItem({ ...newItem, year: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Poster URL</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-xs outline-none font-mono"
                placeholder="https://..."
                value={newItem.image}
                onChange={e => setNewItem({ ...newItem, image: e.target.value })}
              />
              <p className="text-[10px] text-slate-600 mt-1">Paste an image link from IMDb or TMDb</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Status</label>
                <select
                  className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                  value={newItem.status}
                  onChange={e =>
                    setNewItem({ ...newItem, status: e.target.value as 'watching' | 'plan' | 'completed' })
                  }
                >
                  <option value="watching">Watching</option>
                  <option value="plan">Plan to Watch</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Rating (0-5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                  value={newItem.rating}
                  onChange={e => setNewItem({ ...newItem, rating: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="w-full py-3 mt-4 bg-gradient-to-r from-white-600 to-white-700 hover:from-white-500 hover:to-white-600 text-white font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-white-500/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Add to Collection
            </motion.button>
          </form>
        </div>
      </ModalWrapper>
    </motion.div>
  );
};

