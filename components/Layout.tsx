
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  Heart,
  Command,
  Cpu
} from 'lucide-react';
import { User, AccentColor } from '../types';
import { api } from '../services/api';
import { CommandPalette } from './CommandPalette';
import { FaultyTerminal, Magnet } from './Animations';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  accent: AccentColor;
  onLogout: () => void;
}

// --- Cyber-Neko Drone Mascot ---
const SystemMascot = ({ accent }: { accent: string }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [mood, setMood] = useState<'idle' | 'scanning' | 'sleep' | 'alert'>('idle');
  const [dialogue, setDialogue] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Scan line animation state
  const [scanY, setScanY] = useState(0);

  useEffect(() => {
    // Random behaviors
    const behaviorInterval = setInterval(() => {
        if (mood !== 'sleep' && !isHovered) {
             const r = Math.random();
             if (r > 0.7) setMood('scanning');
             else if (r > 0.4) setMood('idle');
        }
    }, 4000);
    return () => clearInterval(behaviorInterval);
  }, [mood, isHovered]);

  useEffect(() => {
     // Scanning animation loop
     if (mood === 'scanning') {
         const scanInterval = setInterval(() => {
             setScanY(prev => (prev + 5) % 80);
         }, 50);
         return () => clearInterval(scanInterval);
     } else {
         setScanY(0);
     }
  }, [mood]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        // Tighter movement for robotic feel
        const x = (e.clientX - centerX) / 40; 
        const y = (e.clientY - centerY) / 40;
        setMousePos({ 
          x: Math.max(-4, Math.min(4, x)), 
          y: Math.max(-4, Math.min(4, y)) 
        });
        
        if (mood === 'sleep') setMood('idle');
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mood]);

  const cyberLines = [
    "System nominal.",
    "Scanning for bugs...",
    "Firewall: Active.",
    "Protocol 47 initiated.",
    "Data stream stable.",
    "I see what you code.",
    "Memory integrity: 99%.",
    "Logic circuits: Green.",
    "Awaiting input.",
    "Don't forget to commit.",
    "Null pointer? Where?"
  ];

  const handleClick = (e: React.MouseEvent) => {
    setMood('alert');
    
    // Pick random line
    const line = cyberLines[Math.floor(Math.random() * cyberLines.length)];
    setDialogue(line);
    setIsHovered(true);
    
    setTimeout(() => {
        setIsHovered(false);
        setMood('idle');
    }, 3000);
  };

  const getEyeColor = () => {
      if (mood === 'alert') return '#ef4444'; // Red
      if (mood === 'scanning') return '#3b82f6'; // Blue
      if (mood === 'sleep') return '#64748b'; // Grey
      return accent === 'violet' ? '#8b5cf6' : '#10b981'; // Default Theme
  };

  return (
    <div 
      className="fixed bottom-8 right-8 z-[60] transition-transform duration-300 hover:scale-110 cursor-pointer animate-float"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{ animationDuration: '4s' }}
    >
      {/* Holographic Speech Bubble */}
      <div className={`
        absolute -top-16 right-0 bg-black/80 text-${accent}-400 border border-${accent}-500/50 text-[10px] font-mono py-2 px-3 rounded-lg
        transform transition-all duration-300 shadow-[0_0_15px_-5px_rgba(var(--accent-rgb),0.5)] whitespace-nowrap z-50 backdrop-blur-md
        ${isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90 pointer-events-none'}
      `}>
        <span className="mr-1 animate-pulse">█</span> {dialogue || "Unit Online."}
      </div>

      <svg 
        ref={svgRef}
        viewBox="0 0 100 100" 
        className="w-24 h-24 drop-shadow-2xl filter" 
        style={{ filter: `drop-shadow(0 0 10px ${getEyeColor()}40)` }}
      >
        <defs>
          <linearGradient id="droneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="#1e293b" />
             <stop offset="50%" stopColor="#0f172a" />
             <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <filter id="glow">
             <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
             <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
             </feMerge>
          </filter>
        </defs>

        {/* Floating Base Body */}
        <path d="M20,40 L30,20 L70,20 L80,40 L70,80 L30,80 Z" fill="url(#droneGrad)" stroke="#475569" strokeWidth="2" />
        
        {/* Tech Details/Lines */}
        <path d="M30,80 L50,90 L70,80" fill="none" stroke="#475569" strokeWidth="1" />
        <line x1="20" y1="40" x2="80" y2="40" stroke="#334155" strokeWidth="1" />

        {/* Ears / Antennae */}
        <path d="M30,20 L25,5" stroke="#475569" strokeWidth="2" />
        <circle cx="25" cy="5" r="2" fill={getEyeColor()} className="animate-pulse" />
        
        <path d="M70,20 L75,5" stroke="#475569" strokeWidth="2" />
        <circle cx="75" cy="5" r="2" fill={getEyeColor()} className="animate-pulse" style={{ animationDelay: '0.5s'}} />

        {/* Visor Area */}
        <g transform={`translate(${mousePos.x}, ${mousePos.y})`}>
           <path d="M30,45 L70,45 L65,65 L35,65 Z" fill="#000" stroke={getEyeColor()} strokeWidth="1" opacity="0.8" />
           
           {/* Eyes */}
           {mood === 'sleep' ? (
              <g>
                <line x1="38" y1="55" x2="48" y2="55" stroke="#475569" strokeWidth="2" />
                <line x1="52" y1="55" x2="62" y2="55" stroke="#475569" strokeWidth="2" />
                <text x="75" y="30" fontSize="10" fill="#475569" className="animate-pulse">Zzz...</text>
              </g>
           ) : (
              <g filter="url(#glow)">
                 {/* Left Eye */}
                 <rect x="38" y="50" width="10" height="10" fill={getEyeColor()} rx="2">
                    {mood === 'alert' && <animate attributeName="height" values="10;2;10" dur="0.2s" repeatCount="1" />}
                 </rect>
                 {/* Right Eye */}
                 <rect x="52" y="50" width="10" height="10" fill={getEyeColor()} rx="2">
                    {mood === 'alert' && <animate attributeName="height" values="10;2;10" dur="0.2s" repeatCount="1" />}
                 </rect>
              </g>
           )}

           {/* Scanning Beam */}
           {mood === 'scanning' && (
               <line x1="30" y1={45 + scanY/4} x2="70" y2={45 + scanY/4} stroke={getEyeColor()} strokeWidth="1" opacity="0.5" />
           )}
        </g>
      </svg>
    </div>
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!layoutRef.current) return;
      const x = (e.clientX / window.innerWidth);
      const y = (e.clientY / window.innerHeight);
      
      requestAnimationFrame(() => {
         if (layoutRef.current) {
            layoutRef.current.style.setProperty('--mouse-x', x.toString());
            layoutRef.current.style.setProperty('--mouse-y', y.toString());
         }
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getColorClass = (isActive: boolean) => {
    if (isActive) {
      return `bg-${accent}-500/10 text-${accent}-400 border-l-2 border-${accent}-500`;
    }
    return 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-l-2 border-transparent';
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Control Center' },
    { to: '/ai', icon: Bot, label: 'Cortex AI' },
    { to: '/journal', icon: Book, label: 'Captain\'s Log' },
    { to: '/media', icon: Film, label: 'Holodeck' },
    { to: '/tasks', icon: CheckSquare, label: 'Quests' },
    { to: '/notes', icon: StickyNote, label: 'Archives' },
    { to: '/files', icon: Folder, label: 'Storage' },
    { to: '/settings', icon: Settings, label: 'Options' },
  ];

  return (
    <div 
      ref={layoutRef}
      className="flex h-screen overflow-hidden bg-[#050505] font-sans text-slate-200"
      style={{ '--mouse-x': '0.5', '--mouse-y': '0.5' } as React.CSSProperties}
    >
      <SystemMascot accent={accent} />
      
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} accent={accent} />

      {/* --- Subtle Faulty Terminal Background --- */}
      <FaultyTerminal text="01LETHRINUS_OS_SYSTEM" speed={80} textColor={accent === 'violet' ? '#8b5cf6' : '#34d399'} fadeSpeed={0.02} />
      
      {/* Background Overlay for Depth */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
         <div 
           className={`absolute top-0 right-0 w-[600px] h-[600px] bg-${accent}-900/10 rounded-full blur-[150px] mix-blend-screen opacity-20 animate-pulse-slow`}
           style={{ transform: 'translate(30%, -30%)' }}
         />
      </div>

      {/* Sidebar - Clean & Modern */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0c]/80 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full relative">
          
          {/* Logo / Header */}
          <div className="p-6 pb-2">
             <div className="flex items-center gap-3 mb-6 group cursor-default">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${accent}-500/10 text-${accent}-500 transition-transform group-hover:rotate-12`}>
                  <Terminal size={18} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-wide">LETHRINUS</h1>
                  <p className="text-[10px] text-slate-500 font-medium">OS v5.1</p>
                </div>
             </div>
             
             <button 
                onClick={() => setIsCmdOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white/5 border border-white/5 rounded-md text-xs text-slate-400 hover:bg-white/10 hover:border-white/10 transition-colors group/cmd"
             >
                <div className="flex items-center gap-2">
                   <Command size={14} />
                   <span>Cmd+K</span>
                </div>
                <span className="text-slate-600">Search...</span>
             </button>
          </div>

          <div className="px-6 my-2">
            <div className="h-[1px] w-full bg-white/5"></div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <Magnet key={item.to} strength={8} activeScale={1.02} className="w-full">
                  <NavLink
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `
                      group flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-md transition-all w-full
                      ${getColorClass(isActive || (item.to !== '/' && location.pathname.startsWith(item.to)))}
                    `}
                  >
                    <item.icon size={16} className={`opacity-70 group-hover:opacity-100 ${location.pathname === item.to ? `text-${accent}-400` : ''}`} />
                    {item.label}
                  </NavLink>
              </Magnet>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5 bg-[#0a0a0c]/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center border border-white/10">
                <UserIcon size={14} className="text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user.name}
                </p>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="text-[10px] text-slate-500 font-medium">Player 1</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500 hover:text-white hover:bg-white/5 rounded transition-colors"
            >
              <LogOut size={12} />
              Quit Game
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0c]/90 backdrop-blur-xl lg:hidden sticky top-0 z-30">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-400">
            <Menu size={24} />
          </button>
          <span className="font-bold text-white tracking-widest text-sm">LETHRINUS</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative">
           <div className="min-h-full">
            {children}
           </div>
        </main>
      </div>
    </div>
  );
};
