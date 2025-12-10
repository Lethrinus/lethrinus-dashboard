import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, CheckSquare, StickyNote, Folder, Settings, Film, Bot, Brain } from 'lucide-react';
import { AccentColor } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  accent: AccentColor;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, accent }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands = [
    { id: 'dash', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'focus', label: 'Enter Focus Mode', icon: Brain, path: '/focus' },
    { id: 'tasks', label: 'View Tasks', icon: CheckSquare, path: '/tasks' },
    { id: 'ai', label: 'Open AI Assistant', icon: Bot, path: '/ai' },
    { id: 'journal', label: 'Write Journal', icon: StickyNote, path: '/journal' },
    { id: 'media', label: 'Entertainment Hub', icon: Film, path: '/media' },
    { id: 'files', label: 'File Storage', icon: Folder, path: '/files' },
    { id: 'settings', label: 'System Settings', icon: Settings, path: '/settings' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-slate-900/90 border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative border-b border-white/5">
          <Search className="absolute left-4 top-4 text-slate-500" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none text-white text-lg px-12 py-3.5 focus:ring-0 placeholder-slate-600 font-mono"
            placeholder="Type a command..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="absolute right-4 top-4 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
            ESC
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={() => {
                  navigate(cmd.path);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                  index === selectedIndex 
                    ? `bg-${accent}-600/20 text-${accent}-100 border border-${accent}-500/30` 
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <cmd.icon size={18} className={index === selectedIndex ? `text-${accent}-400` : ''} />
                <span className="flex-1 font-medium">{cmd.label}</span>
                {index === selectedIndex && (
                  <span className="text-[10px] font-mono opacity-50">↵ Enter</span>
                )}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-slate-500 font-mono text-sm">
              No matching commands.
            </div>
          )}
        </div>
        
        <div className="p-2 bg-black/20 border-t border-white/5 flex justify-between px-4">
             <span className="text-[10px] text-slate-600 font-mono">Lethrinus Command Line</span>
             <span className="text-[10px] text-slate-600 font-mono">v1.0</span>
        </div>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};