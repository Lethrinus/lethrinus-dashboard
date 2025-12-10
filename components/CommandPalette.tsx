// filepath: c:\Users\yavuz\OneDrive\Masaüstü\Longhorn\lethrinus-dashboard\components\CommandPalette.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  CheckSquare,
  StickyNote,
  Folder,
  Settings,
  Film,
  Bot,
  Book,
  Command,
  ArrowRight,
} from 'lucide-react';
import { AccentColor } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  accent: AccentColor;
}

const commands = [
  { id: 'dash', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/', keywords: ['home', 'main', 'control'] },
  { id: 'ai', label: 'Open AI Assistant', icon: Bot, path: '/ai', keywords: ['chat', 'cortex', 'help'] },
  { id: 'journal', label: 'Write Journal', icon: Book, path: '/journal', keywords: ['log', 'diary', 'daily'] },
  { id: 'tasks', label: 'View Tasks', icon: CheckSquare, path: '/tasks', keywords: ['quest', 'todo', 'list'] },
  { id: 'notes', label: 'Open Notes', icon: StickyNote, path: '/notes', keywords: ['archive', 'write', 'memo'] },
  { id: 'media', label: 'Entertainment Hub', icon: Film, path: '/media', keywords: ['movie', 'tv', 'watch'] },
  { id: 'files', label: 'File Storage', icon: Folder, path: '/files', keywords: ['upload', 'documents', 'storage'] },
  { id: 'settings', label: 'System Settings', icon: Settings, path: '/settings', keywords: ['config', 'preferences', 'options'] },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, accent }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filteredCommands = commands.filter(
    cmd =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          navigate(filteredCommands[selectedIndex].path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, navigate, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[15vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl z-[100]"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#131316]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Search Input */}
              <div className="relative border-b border-white/5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full bg-transparent border-none text-white text-lg px-12 py-4 focus:ring-0 placeholder-slate-600 font-mono outline-none"
                  placeholder="Type a command..."
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
                    ESC
                  </kbd>
                </div>
              </div>

              {/* Commands List */}
              <div className="max-h-[350px] overflow-y-auto p-2 custom-scrollbar">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, index) => (
                    <motion.button
                      key={cmd.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => {
                        navigate(cmd.path);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        index === selectedIndex
                          ? 'bg-violet-500/20 text-white border border-violet-500/30'
                          : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <motion.div
                        whileHover={{ rotate: 10 }}
                        className={index === selectedIndex ? 'text-violet-400' : ''}
                      >
                        <cmd.icon size={18} />
                      </motion.div>
                      <span className="flex-1 font-medium">{cmd.label}</span>
                      {index === selectedIndex && (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-slate-500"
                        >
                          <span className="text-[10px] font-mono">↵ Enter</span>
                          <ArrowRight size={14} className="text-violet-400" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center text-slate-500 font-mono text-sm"
                  >
                    <Search size={32} className="mx-auto mb-3 text-slate-700" />
                    No matching commands found
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-black/30 border-t border-white/5 flex justify-between items-center px-4">
                <span className="text-[10px] text-slate-600 font-mono flex items-center gap-2">
                  <Command size={10} />
                  Lethrinus Command Line
                </span>
                <div className="flex items-center gap-3 text-[10px] text-slate-600 font-mono">
                  <span>
                    <kbd className="px-1 py-0.5 rounded bg-slate-800/50 border border-slate-700/50 mr-1">↑</kbd>
                    <kbd className="px-1 py-0.5 rounded bg-slate-800/50 border border-slate-700/50">↓</kbd>
                    to navigate
                  </span>
                  <span>
                    <kbd className="px-1 py-0.5 rounded bg-slate-800/50 border border-slate-700/50">↵</kbd>
                    to select
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

