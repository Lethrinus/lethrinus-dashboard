import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Note, AccentColor } from '../types';
import { Plus, Trash2, Pin, Search } from 'lucide-react';
import { format } from 'date-fns';

interface NotesProps {
  accent: AccentColor;
}

export const Notes: React.FC<NotesProps> = ({ accent }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const data = await api.getNotes();
    setNotes(data);
    if (data.length > 0 && !activeNoteId) {
      setActiveNoteId(data[0].id);
    }
  };

  const handleCreateNote = async () => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Untitled Note',
      content: '',
      folderId: null,
      isPinned: false,
      updatedAt: Date.now()
    };
    await api.saveNote(newNote);
    await loadNotes();
    setActiveNoteId(newNote.id);
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const updated = { ...note, ...updates, updatedAt: Date.now() };
    
    // Optimistic update
    setNotes(notes.map(n => n.id === id ? updated : n));
    
    // Debounce save in real app, straight call here for simplicity
    await api.saveNote(updated);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this note?')) {
      await api.deleteNote(id);
      const remaining = notes.filter(n => n.id !== id);
      setNotes(remaining);
      if (activeNoteId === id) setActiveNoteId(remaining[0]?.id || null);
    }
  };

  const filteredNotes = notes
    .filter(n => (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (n.content || '').toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (b.isPinned === a.isPinned ? b.updatedAt - a.updatedAt : b.isPinned ? 1 : -1));

  const activeNote = notes.find(n => n.id === activeNoteId);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar List */}
      <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
           <div className="relative mb-4">
             <Search size={16} className="absolute left-3 top-3 text-slate-400" />
             <input 
               type="text"
               placeholder="Search notes..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
             />
           </div>
           <button 
             onClick={handleCreateNote}
             className={`w-full py-2 bg-${accent}-600 hover:bg-${accent}-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors`}
           >
             <Plus size={16} /> New Note
           </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map(note => (
            <div 
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`
                p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer group transition-colors
                ${activeNoteId === note.id ? `bg-${accent}-50 dark:bg-${accent}-900/20` : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className={`font-medium truncate ${activeNoteId === note.id ? `text-${accent}-700 dark:text-${accent}-300` : 'text-slate-900 dark:text-slate-200'}`}>
                  {note.title || 'Untitled'}
                </h4>
                {note.isPinned && <Pin size={12} className={`text-${accent}-500 rotate-45`} />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 h-8">
                {note.content || 'No additional text'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{format(note.updatedAt, 'MMM d, h:mm a')}</span>
                <button 
                  onClick={(e) => handleDelete(e, note.id)} 
                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col h-full overflow-hidden">
        {activeNote ? (
          <div className="max-w-3xl w-full mx-auto p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                className="text-3xl font-bold bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white w-full p-0"
                placeholder="Untitled Note"
              />
              <button 
                onClick={() => handleUpdateNote(activeNote.id, { isPinned: !activeNote.isPinned })}
                className={`p-2 rounded-lg transition-colors ${activeNote.isPinned ? `text-${accent}-600 bg-${accent}-100 dark:bg-${accent}-900/30` : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Pin size={20} className={activeNote.isPinned ? 'fill-current' : ''} />
              </button>
            </div>
            <textarea
              value={activeNote.content}
              onChange={(e) => handleUpdateNote(activeNote.id, { content: e.target.value })}
              className="flex-1 w-full bg-transparent border-none focus:ring-0 resize-none text-lg text-slate-700 dark:text-slate-300 leading-relaxed p-0"
              placeholder="Start typing..."
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  );
};