import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileItem, AccentColor } from '../types';
import { Folder, FileText, Image, Film, Music, Download, Trash2, FolderPlus, Upload, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface FilesProps {
  accent: AccentColor;
}

export const Files: React.FC<FilesProps> = ({ accent }) => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const data = await api.getFiles();
    setItems(data);
  };

  const handleCreateFolder = async () => {
    const name = prompt('Folder Name:');
    if (name) {
      await api.createFolder(name, currentFolderId);
      loadFiles();
    }
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
    if (confirm('Delete item?')) {
      await api.deleteFileItem(id);
      loadFiles();
    }
  };

  const currentItems = items.filter(i => i.folderId === currentFolderId);
  const breadcrumbs = [];
  let tempId = currentFolderId;
  while(tempId) {
    const folder = items.find(i => i.id === tempId);
    if(folder) {
      breadcrumbs.unshift(folder);
      tempId = folder.folderId;
    } else {
      break;
    }
  }

  const getIcon = (item: FileItem) => {
    if (item.type === 'folder') return <Folder className={`fill-${accent}-100 text-${accent}-500`} size={40} />;
    if (item.mimeType?.startsWith('image')) return <Image className="text-purple-500" size={40} />;
    return <FileText className="text-slate-400" size={40} />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Files</h1>
        <div className="flex gap-3">
          <button 
            onClick={handleCreateFolder}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FolderPlus size={18} /> New Folder
          </button>
          <label className={`flex items-center gap-2 px-4 py-2 bg-${accent}-600 text-white rounded-lg hover:bg-${accent}-700 transition-colors cursor-pointer`}>
            <Upload size={18} /> Upload
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-lg w-fit">
        <button onClick={() => setCurrentFolderId(null)} className="hover:text-slate-900 dark:hover:text-white">Home</button>
        {breadcrumbs.map(folder => (
          <React.Fragment key={folder.id}>
            <ChevronRight size={14} />
            <button onClick={() => setCurrentFolderId(folder.id)} className="hover:text-slate-900 dark:hover:text-white">{folder.name}</button>
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {currentItems.map(item => (
          <div 
            key={item.id}
            onClick={() => item.type === 'folder' && setCurrentFolderId(item.id)}
            className="group relative flex flex-col items-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="mb-4">{getIcon(item)}</div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200 text-center truncate w-full">{item.name}</p>
            <p className="text-xs text-slate-400 mt-1">{item.type === 'folder' ? 'Folder' : format(item.uploadDate, 'MMM d, yyyy')}</p>
            
            <button 
              onClick={(e) => handleDelete(e, item.id)}
              className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        
        {currentItems.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            This folder is empty
          </div>
        )}
      </div>
    </div>
  );
};