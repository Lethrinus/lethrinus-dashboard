// filepath: c:\Users\yavuz\OneDrive\Masaüstü\Longhorn\lethrinus-dashboard\components\Files.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { FileItem, AccentColor } from '../types';
import {
  Folder,
  FileText,
  Image,
  Trash2,
  FolderPlus,
  Upload,
  ChevronRight,
  HardDrive,
  File,
  Music,
  Video,
} from 'lucide-react';
import { format } from 'date-fns';
import { CardHover, Skeleton, ModalWrapper } from './Animations';

interface FilesProps {
  accent: AccentColor;
}

const getFileIcon = (item: FileItem) => {
  if (item.type === 'folder') return { icon: Folder, color: 'text-violet-400', bg: 'bg-violet-500/20' };
  if (item.mimeType?.startsWith('image')) return { icon: Image, color: 'text-pink-400', bg: 'bg-pink-500/20' };
  if (item.mimeType?.startsWith('video')) return { icon: Video, color: 'text-blue-400', bg: 'bg-blue-500/20' };
  if (item.mimeType?.startsWith('audio')) return { icon: Music, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
  return { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-500/20' };
};

export const Files: React.FC<FilesProps> = ({ accent }) => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

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
      await api.uploadFile(file.name, file.size, file.type, currentFolderId);
      loadFiles();
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

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => item.type === 'folder' && setCurrentFolderId(item.id)}
                  className="group relative"
                >
                  <CardHover className="flex flex-col items-center p-6 bg-[#131316] rounded-2xl border border-white/5 hover:border-violet-500/30 cursor-pointer h-full">
                    <motion.div
                      className={`mb-4 p-4 rounded-xl ${iconConfig.bg}`}
                      whileHover={{ scale: 1.1, rotate: item.type === 'folder' ? 5 : 0 }}
                    >
                      <Icon size={32} className={iconConfig.color} />
                    </motion.div>
                    <p className="text-sm font-medium text-white text-center truncate w-full">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {item.type === 'folder' ? 'Folder' : format(item.uploadDate, 'MMM d')}
                    </p>

                    {/* Delete Button */}
                    <motion.button
                      onClick={e => handleDelete(e, item.id)}
                      className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </CardHover>
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

