import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from './services/api';
import { User, ThemeMode, AccentColor } from './types';

// Components
import { Layout } from './components/Layout';
import { Login } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Journal } from './components/Journal';
import { Tasks } from './components/Tasks';
import { Notes } from './components/Notes';
import { Files } from './components/Files';
import { Media } from './components/Media';
import { SettingsPage } from './components/Settings';
import { AiAssistant } from './components/AiAssistant';
import { Float, PulseRing, DecryptedText } from './components/Animations';
import { Cpu, Terminal, Shield, Zap } from 'lucide-react';

// Enhanced Loading Screen with Boot Sequence
const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const bootSteps = [
    { text: 'Initializing kernel...', icon: Cpu },
    { text: 'Loading system modules...', icon: Terminal },
    { text: 'Establishing secure connection...', icon: Shield },
    { text: 'System ready.', icon: Zap },
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  useEffect(() => {
    const step = Math.floor((progress / 100) * bootSteps.length);
    setCurrentStep(Math.min(step, bootSteps.length - 1));
  }, [progress, bootSteps.length]);

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-[#050505] text-white overflow-hidden relative"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Animated Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-violet-600/20 blur-[100px]"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] rounded-full bg-blue-600/20 blur-[80px]"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo Animation */}
        <Float duration={3}>
          <div className="relative">
            <PulseRing color="rgba(139, 92, 246, 0.4)" size={140} />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                <Terminal size={40} className="text-white" />
              </div>
            </motion.div>
          </div>
        </Float>

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold tracking-widest font-mono mb-2">
            <DecryptedText text="LETHRINUS_OS" speed={50} />
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">Personal Operating System</p>
        </motion.div>

        {/* Boot Messages */}
        <div className="h-24 flex flex-col items-center justify-center gap-2">
          {bootSteps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === idx;
            const isComplete = currentStep > idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: isComplete ? 0.4 : isActive ? 1 : 0,
                  x: isComplete || isActive ? 0 : -10,
                }}
                className={`flex items-center gap-2 text-xs font-mono ${
                  isActive ? 'text-violet-400' : 'text-slate-600'
                }`}
              >
                {(isComplete || isActive) && (
                  <>
                    <Icon size={12} />
                    <span>{isComplete ? '✓' : '>'}</span>
                    <span>{step.text}</span>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-64">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-violet-400"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-600">
            <span>Loading...</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Animated Routes Wrapper
const AnimatedRoutes: React.FC<{
  user: User | null;
  accent: AccentColor;
  theme: ThemeMode;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  handleUpdateSettings: (theme: ThemeMode, accent: AccentColor) => void;
}> = ({ user, accent, theme, setUser, handleUpdateSettings }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" />
            ) : (
              <Login
                onLogin={async () => {
                  const s = await api.getSession();
                  setUser(s.user);
                }}
              />
            )
          }
        />

        <Route
          path="/*"
          element={
            user ? (
              <Layout user={user} accent={accent} onLogout={() => setUser(null)}>
                <Routes>
                  <Route path="/" element={<Dashboard accent={accent} />} />
                  <Route path="/ai" element={<AiAssistant accent={accent} />} />
                  <Route path="/journal" element={<Journal accent={accent} />} />
                  <Route path="/media" element={<Media accent={accent} />} />
                  <Route path="/tasks" element={<Tasks accent={accent} />} />
                  <Route path="/notes" element={<Notes accent={accent} />} />
                  <Route path="/files" element={<Files accent={accent} />} />
                  <Route
                    path="/settings"
                    element={
                      <SettingsPage
                        currentTheme={theme}
                        currentAccent={accent}
                        onUpdate={handleUpdateSettings}
                      />
                    }
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [accent, setAccent] = useState<AccentColor>('violet');
  const [loading, setLoading] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const session = await api.getSession();
        setUser(session.user);
        setTheme('dark');
        setAccent(session.accent || 'violet');
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setInitialized(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, [theme]);

  const handleUpdateSettings = (newTheme: ThemeMode, newAccent: AccentColor) => {
    setTheme('dark');
    setAccent(newAccent);
  };

  const handleLoadingComplete = () => {
    if (initialized) {
      setShowLoadingScreen(false);
      setLoading(false);
    }
  };

  // Wait for both loading animation and initialization
  useEffect(() => {
    if (initialized && !showLoadingScreen) {
      setLoading(false);
    }
  }, [initialized, showLoadingScreen]);

  return (
    <HashRouter>
      <AnimatePresence mode="wait">
        {showLoadingScreen ? (
          <LoadingScreen key="loading" onComplete={handleLoadingComplete} />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedRoutes
              user={user}
              accent={accent}
              theme={theme}
              setUser={setUser}
              handleUpdateSettings={handleUpdateSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </HashRouter>
  );
};

export default App;
