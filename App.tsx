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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const session = await api.getSession();
        setUser(session.user);
        setTheme('dark');
        setAccent(session.accent || 'violet');
        setInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setInitialized(true);
        setLoading(false);
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

  return (
    <HashRouter>
      <AnimatedRoutes
        user={user}
        accent={accent}
        theme={theme}
        setUser={setUser}
        handleUpdateSettings={handleUpdateSettings}
      />
    </HashRouter>
  );
};

export default App;
