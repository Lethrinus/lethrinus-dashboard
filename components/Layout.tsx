// Layout Component - Main App Structure
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Book,
  CheckSquare,
  StickyNote,
  Folder,
  Settings,
  LogOut,
  Menu,
  User as UserIcon,
  Bot,
  Terminal,
  Film,
  Command,
  X,
} from 'lucide-react';
import { User, AccentColor } from '../types';
import { api } from '../services/api';
import { CommandPalette } from './CommandPalette';
import { ParticlesField, AuroraBackground, Magnet, PageTransition, CyberCat } from './Animations';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  accent: AccentColor;
  onLogout: () => void;
}

// Sidebar Animation Variants
const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 25, stiffness: 200 }
  },
  exit: {
    x: -280,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
};

// System Mascot Component - Using CyberCat
const SystemMascot: React.FC<{ accent: string }> = ({ accent }) => {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[60]"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring' }}
    >
      <CyberCat size={80} showDialogue={false} />
    </motion.div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, user, accent, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const layoutRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await api.logout();
    onLogout();
    navigate('/login');
  };

  // Command Palette Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Control Center' },
    { to: '/ai', icon: Bot, label: 'Cortex AI' },
    { to: '/journal', icon: Book, label: "Captain's Log" },
    { to: '/media', icon: Film, label: 'Holodeck' },
    { to: '/tasks', icon: CheckSquare, label: 'Quests' },
    { to: '/notes', icon: StickyNote, label: 'Archives' },
    { to: '/files', icon: Folder, label: 'Storage' },
    { to: '/settings', icon: Settings, label: 'Options' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div
      ref={layoutRef}
      className="flex h-screen overflow-hidden bg-[#050505] font-sans text-slate-200"
    >
      <SystemMascot accent={accent} />
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} accent={accent} />

      {/* Background Effects - New beautiful animations */}
      <AuroraBackground colorStops={['#8b5cf6', '#6366f1', '#3b82f6', '#8b5cf6']} speed={0.3} blur={180} />
      <ParticlesField color="#8b5cf6" particleCount={40} speed={0.3} connectionDistance={100} showConnections={true} />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: 'translate(30%, -30%)' }}
        />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0c]/95 backdrop-blur-xl border-r border-white/5
        transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full relative">
          {/* Logo / Header */}
          <div className="p-6 pb-2">
            <motion.div
              className="flex items-center gap-3 mb-6 group cursor-default"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-lg shadow-violet-500/30"
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Terminal size={20} />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-wide">LETHRINUS</h1>
                <p className="text-[10px] text-slate-500 font-medium">Personal OS v5.2</p>
              </div>
            </motion.div>

            {/* Command Palette Button */}
            <motion.button
              onClick={() => setIsCmdOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-white/5 border border-white/5 rounded-lg text-xs text-slate-400 hover:bg-white/10 hover:border-white/10 transition-all group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <Command size={14} />
                <span className="hidden sm:inline">Quick Actions</span>
              </div>
              <span className="text-slate-600 bg-black/30 px-1.5 py-0.5 rounded text-[10px] font-mono">⌘K</span>
            </motion.button>
          </div>

          <div className="px-6 my-2">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item, index) => {
              const isActive = isActivePath(item.to);
              return (
                <motion.div
                  key={item.to}
                  custom={index}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Magnet strength={10} activeScale={1.02} className="w-full">
                    <NavLink
                      to={item.to}
                      className={`
                        group flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all w-full relative overflow-hidden
                        ${isActive
                          ? 'bg-violet-500/10 text-violet-400'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }
                      `}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-500"
                          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        />
                      )}

                      <item.icon
                        size={16}
                        className={`transition-all ${isActive ? 'text-violet-400' : 'opacity-70 group-hover:opacity-100'}`}
                      />
                      <span className="flex-1">{item.label}</span>

                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-1.5 h-1.5 rounded-full bg-violet-400"
                        />
                      )}
                    </NavLink>
                  </Magnet>
                </motion.div>
              );
            })}
          </nav>

          {/* User Section */}
          <motion.div
            className="p-4 border-t border-white/5 bg-[#0a0a0c]/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center border border-violet-500/30 shadow-lg shadow-violet-500/20"
                whileHover={{ scale: 1.1 }}
              >
                <UserIcon size={16} className="text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <p className="text-[10px] text-slate-500 font-medium">Player 1</p>
                </div>
              </div>
            </div>

            <motion.button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-[10px] font-bold uppercase text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut size={12} />
              End Session
            </motion.button>
          </motion.div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile Header */}
        <motion.header
          className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0c]/90 backdrop-blur-xl lg:hidden sticky top-0 z-30"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <motion.button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Menu size={24} />
          </motion.button>
          <span className="font-bold text-white tracking-widest text-sm flex items-center gap-2">
            <Terminal size={16} className="text-violet-500" />
            LETHRINUS
          </span>
          <div className="w-10" />
        </motion.header>

        {/* Page Content with Transitions */}
        <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <div className="min-h-full">{children}</div>
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Close Button */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed top-4 right-4 z-[60] p-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full text-white lg:hidden"
          >
            <X size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
