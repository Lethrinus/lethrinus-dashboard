import React, { useState, useEffect } from 'react';
import { AccentColor } from '../types';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Brain, Zap } from 'lucide-react';

interface FocusProps {
  accent: AccentColor;
}

export const Focus: React.FC<FocusProps> = ({ accent }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [isImmersive, setIsImmersive] = useState(false);

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound here if implemented
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const setFocusMode = (m: 'work' | 'break') => {
    setMode(m);
    setIsActive(false);
    setTimeLeft(m === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'work' 
    ? 1 - (timeLeft / (25 * 60))
    : 1 - (timeLeft / (5 * 60));

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-full transition-all duration-500 ${isImmersive ? 'fixed inset-0 z-50 bg-[#030712]' : ''}`}>
      
      {/* Neural Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-${accent}-900/10 rounded-full blur-[100px] animate-breathing`}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Mode Switcher */}
        <div className="flex gap-2 mb-12 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
           <button 
             onClick={() => setFocusMode('work')}
             className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${mode === 'work' ? `bg-${accent}-600 text-white shadow-lg shadow-${accent}-500/20` : 'text-slate-400 hover:text-white'}`}
           >
             Neural Link
           </button>
           <button 
             onClick={() => setFocusMode('break')}
             className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${mode === 'break' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
           >
             Recharge
           </button>
        </div>

        {/* The Core Timer */}
        <div className="relative w-80 h-80 flex items-center justify-center mb-12">
           {/* SVG Circle Progress */}
           <svg className="absolute inset-0 w-full h-full -rotate-90">
             <circle 
               cx="160" cy="160" r="150" 
               stroke="currentColor" 
               strokeWidth="4" 
               fill="transparent" 
               className="text-slate-800"
             />
             <circle 
               cx="160" cy="160" r="150" 
               stroke="currentColor" 
               strokeWidth="4" 
               fill="transparent" 
               strokeDasharray={2 * Math.PI * 150}
               strokeDashoffset={2 * Math.PI * 150 * (1 - progress)}
               className={`text-${accent}-500 transition-all duration-1000 ease-linear drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]`}
               strokeLinecap="round"
             />
           </svg>
           
           {/* Inner Pulse */}
           <div className={`absolute inset-4 rounded-full border border-${accent}-500/10 bg-${accent}-500/5 backdrop-blur-sm flex flex-col items-center justify-center ${isActive ? 'animate-breathing' : ''}`}>
              <div className="text-7xl font-mono font-bold text-white tracking-tighter tabular-nums drop-shadow-2xl">
                {formatTime(timeLeft)}
              </div>
              <div className={`mt-4 text-xs font-mono uppercase tracking-[0.3em] text-${accent}-400 flex items-center gap-2`}>
                 <Zap size={12} className={isActive ? 'animate-pulse' : ''} />
                 {isActive ? 'System Active' : 'System Idle'}
              </div>
           </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
           <button 
             onClick={toggleTimer}
             className={`w-16 h-16 rounded-full flex items-center justify-center bg-white text-black hover:scale-110 transition-transform shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]`}
           >
             {isActive ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
           </button>
           
           <button 
             onClick={resetTimer}
             className="w-12 h-12 rounded-full flex items-center justify-center border border-white/20 text-white hover:bg-white/10 transition-colors"
           >
             <RotateCcw size={20} />
           </button>

           <button 
             onClick={() => setIsImmersive(!isImmersive)}
             className="w-12 h-12 rounded-full flex items-center justify-center border border-white/20 text-white hover:bg-white/10 transition-colors"
             title={isImmersive ? "Exit Zen Mode" : "Enter Zen Mode"}
           >
             {isImmersive ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
           </button>
        </div>

      </div>
    </div>
  );
};