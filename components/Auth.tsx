// Login Screen Component with CyberCat
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Terminal, Lock, Mail, ArrowRight, AlertCircle, Zap, Shield, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DecryptedText, SpotlightCard, Magnet, ParticlesField, AuroraBackground, Float, PulseRing } from './Animations';

interface AuthProps {
  onLogin: () => void;
}

export const Login: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const navigate = useNavigate();

  const bootMessages = [
    'Initializing system core...',
    'Loading security protocols...',
    'Establishing encrypted connection...',
    'System ready.',
  ];

  useEffect(() => {
    if (isBooting && bootStep < bootMessages.length) {
      const timer = setTimeout(() => {
        setBootStep(prev => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    } else if (bootStep >= bootMessages.length) {
      const finishTimer = setTimeout(() => setIsBooting(false), 400);
      return () => clearTimeout(finishTimer);
    }
  }, [isBooting, bootStep, bootMessages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.login(email, password);
      onLogin();
      navigate('/');
    } catch (err: any) {
      console.error('Login failed', err);
      setError(err.message || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden relative selection:bg-white/30 selection:text-white">
      {/* Background Effects - Black and White */}
      <AuroraBackground colorStops={['#ffffff', '#888888', '#444444', '#ffffff']} speed={0.4} blur={150} />
      <ParticlesField color="#ffffff" particleCount={50} speed={0.4} connectionDistance={130} showConnections={true} />

      {/* Animated Gradient Orbs - Black and White */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-white/10 blur-[120px]"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-white/10 blur-[100px]"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Boot Screen */}
      <AnimatePresence mode="wait">
        {isBooting ? (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center gap-8"
          >
            <Float duration={2}>
              <div className="relative">
                <PulseRing color="rgba(255, 255, 255, 0.5)" size={120} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <Cpu size={40} className="text-white" />
                  </motion.div>
                </div>
              </div>
            </Float>

            <div className="text-center space-y-4">
              <motion.h1
                className="text-2xl font-bold text-white tracking-widest font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                LETHRINUS
              </motion.h1>

              <div className="h-20 flex flex-col items-center justify-center">
                {bootMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: bootStep > idx ? 0.5 : bootStep === idx ? 1 : 0,
                      y: bootStep >= idx ? 0 : 10
                    }}
                    className={`text-xs font-mono ${bootStep === idx ? 'text-white' : 'text-slate-600'}`}
                  >
                    {bootStep >= idx && (
                      <>
                        <span className="text-emerald-500 mr-2">✓</span>
                        {msg}
                      </>
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-white to-gray-400"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(bootStep / bootMessages.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative z-10 w-full max-w-md p-6"
          >
            <SpotlightCard spotlightColor="rgba(255, 255, 255, 0.1)" className="p-8 backdrop-blur-xl bg-black/40 border-white/5 shadow-2xl">
              {/* Header */}
              <motion.div
                className="flex flex-col items-center mb-8 space-y-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Cat GIF instead of logo */}
                <Float duration={3}>
                  <motion.div className="relative">
                    <motion.img
                      src="/cat.gif"
                      alt="Login animation"
                      className="w-[150px] h-[150px] object-contain relative z-10"
                      style={{
                        filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.4))',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  </motion.div>
                </Float>

                <div className="text-center">
                  <h1 className="text-2xl font-bold text-white tracking-widest font-mono">
                    <DecryptedText text="LETHRINUS_OS" speed={60} />
                  </h1>
                </div>
              </motion.div>

              {/* Form */}
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-400"
                    >
                      <AlertCircle size={14} />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Input */}
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold ml-1 flex items-center gap-1">
                    <Zap size={8} /> Identity
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-white transition-colors">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-slate-200 focus:ring-2 focus:ring-white/50 focus:border-white transition-all placeholder:text-slate-700 font-mono"
                      placeholder="user@lethrinus.sys"
                    />
                  </div>
                </motion.div>

                {/* Password Input */}
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold ml-1 flex items-center gap-1">
                    <Zap size={8} /> Passkey
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-white transition-colors">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-slate-200 focus:ring-2 focus:ring-white/50 focus:border-white transition-all placeholder:text-slate-700 font-mono"
                      placeholder="••••••••••••"
                    />
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative overflow-hidden rounded-lg bg-gradient-to-r from-white to-gray-400 hover:from-gray-200 hover:to-gray-300 text-black py-3 transition-all duration-300 mt-6 shadow-lg shadow-white/25"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Button Shine Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />

                  <div className="flex items-center justify-center gap-2 relative z-10">
                    {loading ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <span className="text-xs font-bold uppercase tracking-widest">Connecting...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-bold uppercase tracking-widest">Initialize Session</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight size={14} />
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.form>
            </SpotlightCard>

            {/* Decorative Elements */}
            <motion.div
              className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-slate-800 font-mono text-[8px] tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              [ LETHRINUS SECURE TERMINAL v5.2.1 ]
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

