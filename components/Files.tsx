// filepath: c:\Users\yavuz\OneDrive\Masaüstü\Longhorn\lethrinus-dashboard\components\Files.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { FileItem, AccentColor } from '../types';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Trash2,
  FolderPlus,
  Upload,
  ChevronRight,
  HardDrive,
  File,
  Music,
  Video,
  X,
  Maximize2,
} from 'lucide-react';
import { format } from 'date-fns';
import { CardHover, Skeleton, ModalWrapper, GlassCard, TiltCard, BorderGlow } from './Animations';

interface FilesProps {
  accent: AccentColor;
}

const getFileIcon = (item: FileItem) => {
  if (item.type === 'folder') return { icon: Folder, color: 'text-violet-400', bg: 'bg-violet-500/20' };
  if (item.mimeType?.startsWith('image')) return { icon: ImageIcon, color: 'text-pink-400', bg: 'bg-pink-500/20' };
  if (item.mimeType?.startsWith('video')) return { icon: Video, color: 'text-blue-400', bg: 'bg-blue-500/20' };
  if (item.mimeType?.startsWith('audio')) return { icon: Music, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
  return { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-500/20' };
};

// Image Preview Component - Optimized
const ImagePreview: React.FC<{
  item: FileItem;
  iconConfig: { icon: any; color: string; bg: string };
  onPreview: () => void;
}> = ({ item, iconConfig, onPreview }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(item.publicUrl || null);
  const [loading, setLoading] = useState(!item.publicUrl);
  const [error, setError] = useState(false);
  const Icon = iconConfig.icon;
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    // If we already have a public URL, use it
    if (item.publicUrl) {
      console.log('Using public URL:', item.publicUrl);
      setImageUrl(item.publicUrl);
      setLoading(false);
      return;
    }

    // If we have storage path but no URL, fetch it
    if (item.storagePath && !item.publicUrl) {
      console.log('Fetching URL for storage path:', item.storagePath);
      setLoading(true);
      api.getFileUrl(item.id)
        .then(url => {
          console.log('Got URL:', url);
          if (mountedRef.current) {
            if (url) {
              setImageUrl(url);
              setLoading(false);
            } else {
              console.warn('No URL returned for item:', item.id);
              setError(true);
              setLoading(false);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load image URL:', err);
          if (mountedRef.current) {
            setError(true);
            setLoading(false);
          }
        });
    } else if (!item.publicUrl && !item.storagePath) {
      // No URL and no storage path - might be a file without storage
      console.warn('No public URL or storage path for item:', item);
      // Try to get URL anyway
      setLoading(true);
      api.getFileUrl(item.id)
        .then(url => {
          if (mountedRef.current) {
            if (url) {
              setImageUrl(url);
              setLoading(false);
            } else {
              setError(true);
              setLoading(false);
            }
          }
        })
        .catch(() => {
          if (mountedRef.current) {
            setError(true);
            setLoading(false);
          }
        });
    }

    return () => {
      mountedRef.current = false;
    };
  }, [item.id, item.publicUrl, item.storagePath]);

  if (error || (!imageUrl && !loading)) {
    return (
      <motion.div
        className={`mb-3 w-full aspect-square rounded-xl ${iconConfig.bg} flex items-center justify-center group/error`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onPreview}
      >
        <div className="relative">
          <Icon size={32} className={iconConfig.color} />
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-[10px] text-slate-500 opacity-0 group-hover/error:opacity-100 transition-opacity text-center">
          Click to retry
        </div>
      </motion.div>
    );
  }

  return (
    <div 
      className="mb-3 w-full aspect-square rounded-xl overflow-hidden bg-black/20 border border-white/10 relative group/image cursor-pointer will-change-transform"
      onClick={onPreview}
    >
      {loading ? (
        <div className="w-full h-full flex items-center justify-center bg-black/20">
          <motion.div
            className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      ) : imageUrl ? (
        <>
          <motion.img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            style={{ 
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
            loading="lazy"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-2"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Maximize2 size={16} className="text-white" />
          </motion.div>
        </>
      ) : null}
    </div>
  );
};

export const Files: React.FC<FilesProps> = ({ accent }) => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await api.getFiles();
      setItems(data);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await api.createFolder(newFolderName, currentFolderId);
    setNewFolderName('');
    setIsModalOpen(false);
    loadFiles();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        await api.uploadFile(file, currentFolderId);
        loadFiles();
      } catch (error: any) {
        console.error('Failed to upload file:', error);
        alert(error?.message || 'Failed to upload file. Please try again.');
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this item?')) {
      await api.deleteFileItem(id);
      loadFiles();
    }
  };

  const currentItems = items.filter(i => i.folderId === currentFolderId);

  // Build breadcrumbs
  const breadcrumbs: FileItem[] = [];
  let tempId = currentFolderId;
  while (tempId) {
    const folder = items.find(i => i.id === tempId);
    if (folder) {
      breadcrumbs.unshift(folder);
      tempId = folder.folderId;
    } else {
      break;
    }
  }

  // Calculate storage stats (mock)
  const totalFiles = items.filter(i => i.type === 'file').length;
  const totalFolders = items.filter(i => i.type === 'folder').length;

  return (
    <motion.div
      className="p-6 max-w-7xl mx-auto h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2.5 rounded-xl bg-violet-500/20 text-violet-400"
            whileHover={{ rotate: 10 }}
          >
            <HardDrive size={24} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-white">Storage</h1>
            <p className="text-xs text-slate-500">
              {totalFiles} files • {totalFolders} folders
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#131316] border border-white/10 text-slate-300 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all font-medium text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FolderPlus size={18} /> New Folder
          </motion.button>
          <label>
            <motion.div
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-xl hover:from-violet-500 hover:to-violet-600 transition-all cursor-pointer font-bold text-sm uppercase tracking-wide shadow-lg shadow-violet-500/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload size={18} /> Upload
            </motion.div>
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </motion.div>

      {/* Breadcrumbs */}
      <motion.div
        className="flex items-center gap-2 text-sm text-slate-500 mb-6 bg-[#131316] px-4 py-2.5 rounded-xl border border-white/5 w-fit"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.button
          onClick={() => setCurrentFolderId(null)}
          className="hover:text-white transition-colors flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
        >
          <HardDrive size={14} />
          Home
        </motion.button>
        {breadcrumbs.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <ChevronRight size={14} className="text-slate-600" />
            <motion.button
              onClick={() => setCurrentFolderId(folder.id)}
              className="hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              {folder.name}
            </motion.button>
          </React.Fragment>
        ))}
      </motion.div>

      {/* Files Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence>
            {currentItems.map((item, index) => {
              const iconConfig = getFileIcon(item);
              const Icon = iconConfig.icon;
              const isImage = item.type === 'file' && item.mimeType?.startsWith('image/');

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    if (item.type === 'folder') {
                      setCurrentFolderId(item.id);
                    }
                    // Image preview is handled by ImagePreview component
                  }}
                  className="group relative"
                >
                  <TiltCard intensity={isImage ? 5 : 8}>
                    <BorderGlow color={isImage ? '#8b5cf6' : '#6366f1'} intensity={isImage ? 0.3 : 0.4}>
                      <div className="flex flex-col items-center p-4 cursor-pointer h-full relative overflow-hidden" style={{ willChange: 'transform' }}>
                        {isImage ? (
                          <ImagePreview 
                            item={item} 
                            iconConfig={iconConfig}
                            onPreview={async () => {
                              setPreviewItem(item);
                              if (item.publicUrl) {
                                setPreviewImage(item.publicUrl);
                              } else if (item.storagePath) {
                                try {
                                  const url = await api.getFileUrl(item.id);
                                  if (url) setPreviewImage(url);
                                } catch (error) {
                                  console.error('Failed to get image URL:', error);
                                }
                              }
                            }}
                          />
                        ) : (
                          <motion.div
                            className={`mb-3 p-4 rounded-xl ${iconConfig.bg} w-full aspect-square flex items-center justify-center`}
                            whileHover={{ scale: 1.1, rotate: item.type === 'folder' ? 5 : 0 }}
                          >
                            <Icon size={32} className={iconConfig.color} />
                          </motion.div>
                        )}
                        <p className="text-sm font-medium text-white text-center truncate w-full mb-1">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {item.type === 'folder' 
                            ? 'Folder' 
                            : isImage 
                            ? `${Math.round((item.size || 0) / 1024)} KB`
                            : format(item.uploadDate, 'MMM d')}
                        </p>

                        {/* Delete Button */}
                        <motion.button
                          onClick={e => handleDelete(e, item.id)}
                          className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </BorderGlow>
                  </TiltCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && currentItems.length === 0 && (
        <motion.div
          className="flex-1 flex flex-col items-center justify-center py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Folder size={64} className="text-slate-700 mb-4" />
          </motion.div>
          <p className="text-slate-500 text-lg font-medium">This folder is empty</p>
          <p className="text-slate-600 text-sm mt-1">Upload files or create a new folder</p>
        </motion.div>
      )}

      {/* Image Preview Modal */}
      <ModalWrapper isOpen={!!previewImage} onClose={() => {
        setPreviewImage(null);
        setPreviewItem(null);
      }}>
        {previewImage && previewItem && (
          <GlassCard className="max-w-4xl w-full p-0 overflow-hidden" blur={20} opacity={0.1}>
            <div className="relative">
              <motion.button
                onClick={() => {
                  setPreviewImage(null);
                  setPreviewItem(null);
                }}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
              <img
                src={previewImage}
                alt={previewItem.name}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white font-bold text-lg mb-1">{previewItem.name}</h3>
                <p className="text-slate-300 text-sm">
                  {previewItem.size ? `${(previewItem.size / 1024).toFixed(2)} KB` : ''} • 
                  {previewItem.uploadDate ? ` Uploaded ${format(previewItem.uploadDate, 'MMM d, yyyy')}` : ''}
                </p>
              </div>
            </div>
          </GlassCard>
        )}
      </ModalWrapper>

      {/* Create Folder Modal */}
      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-[#131316] rounded-xl w-full max-w-md p-6 border border-white/10">
          <h2 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
            <FolderPlus size={20} className="text-violet-500" />
            Create New Folder
          </h2>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleCreateFolder();
            }}
          >
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white focus:border-violet-500 outline-none transition-colors mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <motion.button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold uppercase"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg text-xs font-bold uppercase shadow-lg shadow-violet-500/25"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create
              </motion.button>
            </div>
          </form>
        </div>
      </ModalWrapper>
    </motion.div>
  );
};

