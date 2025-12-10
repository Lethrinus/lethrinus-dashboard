// Focus Mode - Pomodoro Timer Component
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, Target } from 'lucide-react';
import { AccentColor } from '../types';

interface FocusProps {
  accent: AccentColor;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const modeConfig = {
  work: { duration: 25 * 60, label: 'Focus Time', icon: Brain, color: 'violet' },
  shortBreak: { duration: 5 * 60, label: 'Short Break', icon: Coffee, color: 'emerald' },
  longBreak: { duration: 15 * 60, label: 'Long Break', icon: Target, color: 'blue' },
};

export const Focus: React.FC<FocusProps> = ({ accent }) => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(modeConfig.work.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const config = modeConfig[mode];
  const progress = ((config.duration - timeLeft) / config.duration) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      if (mode === 'work') {
        setCompletedSessions(prev => prev + 1);
        // Auto switch to break
        const newMode = completedSessions > 0 && (completedSessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
        setMode(newMode);
        setTimeLeft(modeConfig[newMode].duration);
      } else {
        setMode('work');
        setTimeLeft(modeConfig.work.duration);
      }
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, completedSessions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(modeConfig[newMode].duration);
    setIsRunning(false);
  };

  const handleReset = () => {
    setTimeLeft(config.duration);
    setIsRunning(false);
  };

  const Icon = config.icon;

  return (
    <motion.div
      className="p-6 lg:p-10 max-w-2xl mx-auto min-h-full flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: isRunning ? 360 : 0 }}
            transition={{ duration: 4, repeat: isRunning ? Infinity : 0, ease: 'linear' }}
          >
            <Brain className="text-violet-500" size={32} />
          </motion.div>
          Focus Mode
        </h1>
        <p className="text-slate-500">Stay productive with the Pomodoro technique</p>
      </motion.div>

      {/* Mode Selector */}
      <motion.div
        className="flex gap-2 mb-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {(Object.keys(modeConfig) as TimerMode[]).map(m => {
          const mConfig = modeConfig[m];
          return (
            <motion.button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === m
                  ? `bg-${mConfig.color}-500/20 text-${mConfig.color}-400 border border-${mConfig.color}-500/30`
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {mConfig.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Timer Circle */}
      <motion.div
        className="relative mb-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <svg className="w-72 h-72 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="144"
            cy="144"
            r="130"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx="144"
            cy="144"
            r="130"
            stroke={`url(#gradient-${mode})`}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 130}
            initial={{ strokeDashoffset: 2 * Math.PI * 130 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 130 * (1 - progress / 100) }}
            transition={{ duration: 0.5 }}
          />
          <defs>
            <linearGradient id="gradient-work" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="gradient-shortBreak" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="gradient-longBreak" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
        </svg>

        {/* Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className={`mb-2 p-3 rounded-full bg-${config.color}-500/20`}
            animate={isRunning ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
          >
            <Icon size={24} className={`text-${config.color}-400`} />
          </motion.div>
          <motion.span
            className="text-6xl font-bold text-white font-mono"
            key={timeLeft}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            {formatTime(timeLeft)}
          </motion.span>
          <span className={`text-sm text-${config.color}-400 mt-2`}>{config.label}</span>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={handleReset}
          className="p-3 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw size={20} />
        </motion.button>

        <motion.button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-8 py-4 rounded-xl font-bold text-white flex items-center gap-2 ${
            isRunning
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : `bg-gradient-to-r from-${config.color}-600 to-${config.color}-700 shadow-lg shadow-${config.color}-500/25`
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isRunning ? (
            <>
              <Pause size={20} /> Pause
            </>
          ) : (
            <>
              <Play size={20} /> Start
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Sessions Counter */}
      <motion.div
        className="mt-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm text-slate-500">
          Sessions completed today:{' '}
          <span className="text-violet-400 font-bold">{completedSessions}</span>
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < completedSessions % 4 ? 'bg-violet-500' : 'bg-white/10'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            />
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-2">
          {4 - (completedSessions % 4)} sessions until long break
        </p>
      </motion.div>
    </motion.div>
  );
};
