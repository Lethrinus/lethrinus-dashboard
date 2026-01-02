// filepath: c:\Users\yavuz\OneDrive\Masaüstü\Longhorn\lethrinus-dashboard\components\Notes.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { Note, AccentColor } from '../types';
import { Plus, Trash2, Pin, Search, FileText, Sparkles, Save, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { SpotlightCard, CardHover, Skeleton, GlassCard, GradientText, Shimmer, ConfirmDialog } from './Animations';

interface NotesProps {
  accent: AccentColor;
}

export const Notes: React.FC<NotesProps> = ({ accent }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    noteId: string | null;
  }>({ isOpen: false, noteId: null });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await api.getNotes();
      setNotes(data);
      if (data.length > 0 && !activeNoteId) {
        setActiveNoteId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Untitled Note',
      content: '',
      folderId: null,
      isPinned: false,
      updatedAt: Date.now(),
    };

    try {
      const savedNote = await api.saveNote(newNote);
      setNotes(prev => [savedNote, ...prev]);
      setActiveNoteId(savedNote.id);
    } catch (error) {
      console.error('Failed to create note:', error);
      // Still add locally if API fails
      setNotes(prev => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
    }
  };

  const performSave = useCallback(async (id: string, updates: Partial<Note>) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const updated = { ...note, ...updates, updatedAt: Date.now() };

    // Update local state immediately for responsiveness
    setNotes(prev => prev.map(n => (n.id === id ? updated : n)));

    setSaveStatus('saving');
    setErrorMessage(null);

    try {
      const savedNote = await api.saveNote(updated);
      // Update with server response (might have new ID if it was a temp ID)
      setNotes(prev => prev.map(n => (n.id === id ? savedNote : n)));
      if (activeNoteId === id && savedNote.id !== id) {
        setActiveNoteId(savedNote.id);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: any) {
      console.error('Failed to save note:', error);
      setSaveStatus('error');
      setErrorMessage(error?.message || 'Failed to save note. Please try again.');
      setTimeout(() => {
        setSaveStatus('idle');
        setErrorMessage(null);
      }, 5000);
    }
  }, [notes, activeNoteId]);

  const handleUpdateNote = useCallback((id: string, updates: Partial<Note>) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Update local state immediately
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const updated = { ...note, ...updates, updatedAt: Date.now() };
    setNotes(prev => prev.map(n => (n.id === id ? updated : n)));

    // Debounce API call (1.5 seconds)
    saveTimeoutRef.current = setTimeout(() => {
      performSave(id, updates);
    }, 1500);
  }, [notes, performSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDialog({ isOpen: true, noteId: id });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.noteId) return;
    const id = confirmDialog.noteId;
    await api.deleteNote(id);
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id) setActiveNoteId(remaining[0]?.id || null);
    setConfirmDialog({ isOpen: false, noteId: null });
  };

  const filteredNotes = notes
    .filter(
      n =>
        (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.content || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (b.isPinned === a.isPinned ? b.updatedAt - a.updatedAt : b.isPinned ? 1 : -1));

  const activeNote = notes.find(n => n.id === activeNoteId);

  return (
    <motion.div
      className="flex h-full overflow-hidden bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Sidebar List */}
      <motion.div
        className="w-80 bg-black/10 backdrop-blur-xl border-r border-white/10 flex flex-col"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <motion.div
            className="relative mb-4"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Search size={16} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-white-500/50 focus:border-white-500 outline-none transition-all"
            />
          </motion.div>
          <motion.button
            onClick={handleCreateNote}
            className="w-full py-2.5 bg-gradient-to-r from-white-600 to-white-700 hover:from-white-500 hover:to-white-600 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide transition-all shadow-lg shadow-white-500/25"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Plus size={16} /> New Note
          </motion.button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <AnimatePresence>
              {filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`
                    p-4 border-b border-white/5 cursor-pointer group transition-all relative
                    ${activeNoteId === note.id ? 'bg-white-500/10' : 'hover:bg-white/5'}
                  `}
                >
                  {/* Active Indicator */}
                  {activeNoteId === note.id && (
                    <motion.div
                      layoutId="activeNote"
                      className="absolute left-0 top-0 bottom-0 w-0.5 bg-white-500"
                    />
                  )}

                  <div className="flex justify-between items-start mb-1">
                    <h4
                      className={`font-medium truncate flex-1 ${
                        activeNoteId === note.id ? 'text-white-300' : 'text-white'
                      }`}
                    >
                      {note.title || 'Untitled'}
                    </h4>
                    {note.isPinned && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-white-500"
                      >
                        <Pin size={12} className="rotate-45 fill-current" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2 h-8">
                    {note.content || 'No additional text'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-600">
                      {format(note.updatedAt, 'MMM d, h:mm a')}
                    </span>
                    <motion.button
                      onClick={e => handleDelete(e, note.id)}
                      className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!loading && filteredNotes.length === 0 && (
            <div className="p-8 text-center">
              <FileText size={32} className="mx-auto mb-3 text-slate-700" />
              <p className="text-slate-500 text-sm">No notes yet</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Editor */}
      <motion.div
        className="flex-1 bg-black/10 backdrop-blur-xl flex flex-col h-full overflow-hidden relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />

        {activeNote ? (
          <motion.div
            key={activeNote.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-8 h-full flex flex-col relative z-10"
          >
            {/* Title Row */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <input
                type="text"
                value={activeNote.title}
                onChange={e => handleUpdateNote(activeNote.id, { title: e.target.value })}
                className="flex-1 text-3xl font-bold bg-transparent border-none focus:ring-0 text-white p-0 outline-none placeholder-slate-700"
                placeholder="Untitled Note"
              />
              <div className="flex items-center gap-2">
                {/* Save Status */}
                <AnimatePresence mode="wait">
                  {saveStatus === 'saving' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 text-xs text-slate-400"
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full bg-white-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span>Saving...</span>
                    </motion.div>
                  )}
                  {saveStatus === 'saved' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 text-xs text-emerald-400"
                    >
                      <Check size={14} />
                      <span>Saved</span>
                    </motion.div>
                  )}
                  {saveStatus === 'error' && errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 text-xs text-red-400"
                      title={errorMessage}
                    >
                      <AlertCircle size={14} />
                      <span>Error</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={() => handleUpdateNote(activeNote.id, { isPinned: !activeNote.isPinned })}
                  className={`p-2.5 rounded-lg transition-all ${
                    activeNote.isPinned
                      ? 'text-white-400 bg-white-500/20 border border-white-500/30'
                      : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Pin size={20} className={activeNote.isPinned ? 'fill-current rotate-45' : ''} />
                </motion.button>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 mb-6 text-xs text-slate-600">
              <span>Last edited: {format(activeNote.updatedAt, 'MMM d, yyyy h:mm a')}</span>
              <span>•</span>
              <span>{activeNote.content?.length || 0} characters</span>
              <span>•</span>
              <span>{activeNote.content?.split(/\s+/).filter(Boolean).length || 0} words</span>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400"
                >
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <textarea
              value={activeNote.content}
              onChange={e => handleUpdateNote(activeNote.id, { content: e.target.value })}
              className="flex-1 w-full bg-transparent border-none focus:ring-0 resize-none text-lg text-slate-300 leading-relaxed p-0 outline-none placeholder-slate-700"
              placeholder="Start typing..."
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <Sparkles size={48} className="mx-auto mb-4 text-slate-700" />
              <p className="text-lg font-medium">Select a note or create a new one</p>
              <p className="text-sm text-slate-600 mt-1">Your thoughts, captured digitally</p>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, noteId: null })}
        onConfirm={confirmDelete}
        title="Delete Note?"
        message="This note will be permanently removed. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </motion.div>
  );
};

