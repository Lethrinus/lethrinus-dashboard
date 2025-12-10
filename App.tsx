import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin shadow-[0_0_25px_rgba(139,92,246,0.3)]"></div>
      <div className="text-xs font-mono text-violet-500/80 animate-pulse tracking-[0.3em] font-bold">SYSTEM BOOT...</div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('dark'); 
  const [accent, setAccent] = useState<AccentColor>('violet'); // Changed to Violet for Cyberpunk theme
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const session = await api.getSession();
      setUser(session.user);
      setTheme('dark'); 
      setAccent('violet'); // Override session accent for the new theme launch
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    // Force Dark Mode class on body
    document.documentElement.classList.add('dark');
  }, [theme]);

  const handleUpdateSettings = (newTheme: ThemeMode, newAccent: AccentColor) => {
    setTheme('dark'); // Enforce dark
    setAccent(newAccent);
  };

  if (loading) return <LoadingScreen />;

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <Login onLogin={async () => {
             const s = await api.getSession();
             setUser(s.user);
             setAccent('violet');
          }} />
        } />
        
        <Route path="/*" element={
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
                <Route path="/settings" element={<SettingsPage currentTheme={theme} currentAccent={accent} onUpdate={handleUpdateSettings} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;