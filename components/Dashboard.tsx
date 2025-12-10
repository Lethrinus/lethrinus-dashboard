
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Task, JournalEntry, AccentColor } from '../types';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  CalendarDays, 
  FileText,
  Upload,
  ArrowRight,
  Gamepad2,
  Tv
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DecryptedText, SpotlightCard, Magnet, ShinyText } from './Animations';

interface DashboardProps {
  accent: AccentColor;
}

const QUOTES = [
    { text: "It's dangerous to go alone! Take this.", source: "The Legend of Zelda" },
    { text: "The cake is a lie.", source: "Portal" },
    { text: "Do or do not. There is no try.", source: "Star Wars" },
    { text: "Winter is coming.", source: "Game of Thrones" },
    { text: "I'm sorry, Dave. I'm afraid I can't do that.", source: "2001: A Space Odyssey" },
    { text: "War... war never changes.", source: "Fallout" },
    { text: "Identity theft is not a joke, Jim!", source: "The Office" },
    { text: "Good morning, Vault Dweller.", source: "Fallout" },
    { text: "Would you kindly?", source: "BioShock" },
    { text: "Don't panic.", source: "Hitchhiker's Guide to the Galaxy" }
];

export const Dashboard: React.FC<DashboardProps> = ({ accent }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayJournal, setTodayJournal] = useState<JournalEntry | null>(null);
  const [quote, setQuote] = useState(QUOTES[0]);
  const navigate = useNavigate();

  useEffect(() => {
    // Pick random quote
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    const loadData = async () => {
      const [fetchedTasks, fetchedJournal] = await Promise.all([
        api.getTasks(),
        api.getJournalEntries()
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todaysEntry = fetchedJournal.find(j => j.date === today);
      setTodayJournal(todaysEntry || null);

      setTasks(fetchedTasks.filter(t => t.status !== 'done').slice(0, 5));
    };
    loadData();
  }, []);

  // Pre-calculate grid color to avoid "union type too complex" error in template literal
  const gridColor = `rgba(var(--${accent}-rgb), .3)`;
  const gridBackground = `linear-gradient(0deg, transparent 24%, ${gridColor} 25%, ${gridColor} 26%, transparent 27%, transparent 74%, ${gridColor} 75%, ${gridColor} 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, ${gridColor} 25%, ${gridColor} 26%, transparent 27%, transparent 74%, ${gridColor} 75%, ${gridColor} 76%, transparent 77%, transparent)`;

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header / Briefing */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Gamepad2 size={14} />
            <DecryptedText text="Base of Operations" speed={30} />
        </div>
        
        <SpotlightCard className="p-8 relative overflow-hidden group min-h-[160px] flex flex-col justify-center">
            <div className={`absolute top-0 left-0 w-1 h-full bg-${accent}-500`}></div>
            <h2 className="text-2xl font-bold text-white mb-2 font-serif italic relative z-10 max-w-2xl">
                "<ShinyText text={quote.text} />"
            </h2>
            <p className={`text-${accent}-400 text-sm font-medium relative z-10`}>— {quote.source}</p>
            
            <div className="absolute top-4 right-4 text-slate-700 opacity-20 group-hover:opacity-40 transition-opacity">
                <Tv size={64} />
            </div>
        </SpotlightCard>
      </div>

      {/* Quick Access Grid - using Spotlight Cards & Magnets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Captain's Log - Data Stream Background */}
        <Magnet strength={10} activeScale={1.05} className="h-full">
            <SpotlightCard className="relative group overflow-hidden">
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none" 
                     style={{ 
                         backgroundImage: gridBackground,
                         backgroundSize: '30px 30px'
                     }}
                />
                <button onClick={() => navigate('/journal')} className="w-full h-full p-6 flex flex-col items-center gap-3 relative z-10">
                    <div className={`p-3 rounded-full bg-${accent}-500/20 text-${accent}-400 shadow-[0_0_20px_-5px_rgba(var(--accent-rgb),0.5)] group-hover:scale-110 transition-transform`}>
                        <CalendarDays size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-200 tracking-wide uppercase">Captain's Log</span>
                </button>
            </SpotlightCard>
        </Magnet>

        {/* Active Quests */}
        <Magnet strength={10} activeScale={1.05} className="h-full">
            <SpotlightCard>
                <button onClick={() => navigate('/tasks')} className="w-full h-full p-6 flex flex-col items-center gap-3 hover:bg-white/5 transition-colors">
                    <div className={`p-3 rounded-full bg-${accent}-500/10 text-${accent}-500 shadow-[0_0_15px_-5px_rgba(var(--accent-rgb),0.3)]`}>
                        <CheckCircle2 size={24} />
                    </div>
                    <span className="text-sm font-medium text-slate-200">Active Quests</span>
                </button>
            </SpotlightCard>
        </Magnet>

        {/* Archives - Hex Grid Background */}
        <Magnet strength={10} activeScale={1.05} className="h-full">
            <SpotlightCard className="relative group overflow-hidden">
                 <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
                      style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='40' viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c5.523 0 10-4.477 10-10V10c0-5.523 4.477-10 10-10s10 4.477 10 10v20c0 5.523-4.477 10-10 10S0 35.523 0 30v10z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`
                      }} 
                 />
                <button onClick={() => navigate('/notes')} className="w-full h-full p-6 flex flex-col items-center gap-3 relative z-10">
                    <div className={`p-3 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shadow-inner group-hover:text-${accent}-400 group-hover:border-${accent}-500/50 transition-colors`}>
                        <FileText size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-200 tracking-wide uppercase">Archives</span>
                </button>
            </SpotlightCard>
        </Magnet>

        {/* Inventory */}
        <Magnet strength={10} activeScale={1.05} className="h-full">
            <SpotlightCard>
                <button onClick={() => navigate('/files')} className="w-full h-full p-6 flex flex-col items-center gap-3 hover:bg-white/5 transition-colors">
                    <div className={`p-3 rounded-full bg-${accent}-500/10 text-${accent}-500 shadow-[0_0_15px_-5px_rgba(var(--accent-rgb),0.3)]`}>
                        <Upload size={24} />
                    </div>
                    <span className="text-sm font-medium text-slate-200">Inventory</span>
                </button>
            </SpotlightCard>
        </Magnet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Log - FIXED OVERFLOW */}
        <SpotlightCard className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Daily Log</h3>
            <Link to="/journal" className={`text-xs font-bold text-${accent}-400 hover:text-${accent}-300 flex items-center gap-1`}>
              OPEN <ArrowRight size={12} />
            </Link>
          </div>
          {todayJournal ? (
            <div className="flex-1 p-4 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:border-white/10 transition-colors flex flex-col" onClick={() => navigate('/journal')}>
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                {todayJournal.title || 'Untitled Log'}
              </h4>
              {/* Constrained Height Container with Gradient Fade */}
              <div className="relative h-20 overflow-hidden">
                 <p className="text-sm text-slate-400 leading-relaxed">
                   {todayJournal.content}
                 </p>
                 <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-[#131316] to-transparent"></div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 bg-black/20 rounded-xl border border-dashed border-white/5">
              <p className="text-xs mb-3">No entry recorded for Stardate {format(new Date(), "yyyyMM.dd")}</p>
              <button 
                onClick={() => navigate('/journal')}
                className={`px-4 py-2 bg-${accent}-600/10 text-${accent}-400 border border-${accent}-500/30 rounded-lg text-xs font-bold uppercase transition-colors hover:bg-${accent}-600/20`}
              >
                Write Entry
              </button>
            </div>
          )}
        </SpotlightCard>

        {/* Current Questline */}
        <SpotlightCard className="p-6 h-full">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Side Quests</h3>
            <Link to="/tasks" className={`text-xs font-bold text-${accent}-400 hover:text-${accent}-300 flex items-center gap-1`}>
              QUEST LOG <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {tasks.length > 0 ? tasks.map(task => (
               <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-sm ${task.priority === 'high' ? 'bg-red-500 animate-pulse' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span className="text-sm font-medium text-slate-300">{task.title}</span>
                 </div>
               </div>
            )) : (
              <p className="text-center py-8 text-slate-500 text-xs uppercase">No active quests.</p>
            )}
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
};
