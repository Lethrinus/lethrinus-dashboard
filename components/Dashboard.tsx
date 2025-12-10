// filepath: c:\Users\yavuz\OneDrive\Masaüstü\Longhorn\lethrinus-dashboard\components\Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  Tv,
  Sparkles,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DecryptedText,
  SpotlightCard,
  Magnet,
  ShinyText,
  FadeIn,
  StaggerContainer,
  CardHover,
  ProgressBar,
  Skeleton,
} from './Animations';

interface DashboardProps {
  accent: AccentColor;
}

const QUOTES = [
  { text: "It's dangerous to go alone! Take this.", source: 'The Legend of Zelda' },
  { text: 'The cake is a lie.', source: 'Portal' },
  { text: 'Do or do not. There is no try.', source: 'Star Wars' },
  { text: 'Winter is coming.', source: 'Game of Thrones' },
  { text: "I'm sorry, Dave. I'm afraid I can't do that.", source: '2001: A Space Odyssey' },
  { text: 'War... war never changes.', source: 'Fallout' },
  { text: 'Would you kindly?', source: 'BioShock' },
  { text: "Don't panic.", source: "Hitchhiker's Guide to the Galaxy" },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ accent }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayJournal, setTodayJournal] = useState<JournalEntry | null>(null);
  const [quote, setQuote] = useState(QUOTES[0]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completed: 0, total: 0, streak: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    const loadData = async () => {
      try {
        const [fetchedTasks, fetchedJournal] = await Promise.all([
          api.getTasks(),
          api.getJournalEntries(),
        ]);

        const today = new Date().toISOString().split('T')[0];
        const todaysEntry = fetchedJournal.find(j => j.date === today);
        setTodayJournal(todaysEntry || null);

        const activeTasks = fetchedTasks.filter(t => t.status !== 'done').slice(0, 5);
        setTasks(activeTasks);

        // Calculate stats
        const completed = fetchedTasks.filter(t => t.status === 'done').length;
        setStats({
          completed,
          total: fetchedTasks.length,
          streak: fetchedJournal.length // Simplified streak calculation
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <motion.div
      className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header / Briefing */}
      <motion.div variants={itemVariants} className="space-y-4 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Gamepad2 size={14} />
          </motion.div>
          <DecryptedText text="Base of Operations" speed={30} />
        </div>

        <SpotlightCard className="p-8 relative overflow-hidden group min-h-[160px] flex flex-col justify-center">
          <motion.div
            className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-violet-700"
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          <motion.h2
            className="text-2xl font-bold text-white mb-2 font-serif italic relative z-10 max-w-2xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            "<ShinyText text={quote.text} />"
          </motion.h2>

          <motion.p
            className="text-violet-400 text-sm font-medium relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            — {quote.source}
          </motion.p>

          <motion.div
            className="absolute top-4 right-4 text-slate-700 opacity-20 group-hover:opacity-40 transition-opacity"
            whileHover={{ rotate: 15, scale: 1.1 }}
          >
            <Tv size={64} />
          </motion.div>
        </SpotlightCard>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        <CardHover className="bg-[#131316] rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <TrendingUp size={18} className="text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{completionRate}%</p>
              <p className="text-xs text-slate-500">Quest Completion</p>
            </div>
          </div>
          <ProgressBar progress={completionRate} color="#8b5cf6" />
        </CardHover>

        <CardHover className="bg-[#131316] rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
              <p className="text-xs text-slate-500">Quests Completed</p>
            </div>
          </div>
        </CardHover>

        <CardHover className="bg-[#131316] rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Zap size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.streak}</p>
              <p className="text-xs text-slate-500">Day Streak</p>
            </div>
          </div>
        </CardHover>
      </motion.div>

      {/* Quick Access Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: CalendarDays, label: "Captain's Log", path: '/journal', color: 'violet' },
          { icon: CheckCircle2, label: 'Active Quests', path: '/tasks', color: 'blue' },
          { icon: FileText, label: 'Archives', path: '/notes', color: 'emerald' },
          { icon: Upload, label: 'Inventory', path: '/files', color: 'amber' },
        ].map((item, index) => (
          <Magnet key={item.path} strength={10} activeScale={1.05} className="h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <SpotlightCard className="relative group overflow-hidden h-full">
                <motion.button
                  onClick={() => navigate(item.path)}
                  className="w-full h-full p-6 flex flex-col items-center gap-3 relative z-10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className={`p-3 rounded-full bg-${item.color}-500/20 text-${item.color}-400`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon size={24} />
                  </motion.div>
                  <span className="text-sm font-bold text-slate-200 tracking-wide uppercase">
                    {item.label}
                  </span>
                </motion.button>

                {/* Hover gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-t from-${item.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />
              </SpotlightCard>
            </motion.div>
          </Magnet>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Log */}
        <motion.div variants={itemVariants}>
          <SpotlightCard className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} />
                Daily Log
              </h3>
              <Link
                to="/journal"
                className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 group"
              >
                OPEN
                <motion.div
                  className="inline-block"
                  whileHover={{ x: 3 }}
                >
                  <ArrowRight size={12} />
                </motion.div>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : todayJournal ? (
              <motion.div
                className="flex-1 p-4 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:border-violet-500/30 transition-all flex flex-col"
                onClick={() => navigate('/journal')}
                whileHover={{ scale: 1.01 }}
              >
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-violet-400" />
                  {todayJournal.title || 'Untitled Log'}
                </h4>
                <div className="relative h-20 overflow-hidden">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {todayJournal.content}
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-[#131316] to-transparent" />
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-8 text-slate-500 bg-black/20 rounded-xl border border-dashed border-white/5">
                <p className="text-xs mb-3">
                  No entry recorded for Stardate {format(new Date(), 'yyyyMM.dd')}
                </p>
                <motion.button
                  onClick={() => navigate('/journal')}
                  className="px-4 py-2 bg-violet-600/10 text-violet-400 border border-violet-500/30 rounded-lg text-xs font-bold uppercase transition-colors hover:bg-violet-600/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Write Entry
                </motion.button>
              </div>
            )}
          </SpotlightCard>
        </motion.div>

        {/* Current Questline */}
        <motion.div variants={itemVariants}>
          <SpotlightCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Zap size={14} />
                Active Side Quests
              </h3>
              <Link
                to="/tasks"
                className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 group"
              >
                QUEST LOG
                <motion.div className="inline-block" whileHover={{ x: 3 }}>
                  <ArrowRight size={12} />
                </motion.div>
              </Link>
            </div>

            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))
              ) : tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 hover:border-violet-500/20 transition-all cursor-pointer group"
                    onClick={() => navigate('/tasks')}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`w-2 h-2 rounded-sm ${
                          task.priority === 'high'
                            ? 'bg-red-500'
                            : task.priority === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        animate={task.priority === 'high' ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                        {task.title}
                      </span>
                    </div>
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -5 }}
                      whileHover={{ x: 0 }}
                    >
                      <ArrowRight size={14} className="text-violet-400" />
                    </motion.div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs uppercase">
                  <Sparkles size={24} className="mx-auto mb-2 text-slate-600" />
                  No active quests. Time to relax!
                </div>
              )}
            </div>
          </SpotlightCard>
        </motion.div>
      </div>

      {/* Quick Tips */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-center gap-4 py-4 text-[10px] text-slate-600 font-mono">
          <span>TIP: Press ⌘K for quick navigation</span>
          <span>•</span>
          <span>All data synced to cloud</span>
          <span>•</span>
          <span>System Status: <span className="text-emerald-500">Operational</span></span>
        </div>
      </motion.div>
    </motion.div>
  );
};

