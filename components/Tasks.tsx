// filepath: c:\Users\yavuz\OneDrive\Masaüstü\Longhorn\lethrinus-dashboard\components\Tasks.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { api } from '../services/api';
import { Task, AccentColor, Subtask, AiConfig } from '../types';
import {
  Plus,
  LayoutList,
  Kanban,
  Trash2,
  Sparkles,
  Check,
  X,
  Loader2,
  Sword,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { SpotlightCard, ModalWrapper, CardHover, Skeleton } from './Animations';

interface TasksProps {
  accent: AccentColor;
}

const priorityConfig = {
  high: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
};

const statusConfig = {
  todo: { label: 'To Do', color: 'text-slate-400', bg: 'bg-slate-500/10' },
  'in-progress': { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  done: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

export const Tasks: React.FC<TasksProps> = ({ accent }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AiConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const [quickTitle, setQuickTitle] = useState('');
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    subtasks: [],
  });

  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Task['status'] | null>(null);

  useEffect(() => {
    loadTasks();
    loadAiConfig();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAiConfig = async () => {
    const session = await api.getSession();
    setAiConfig(session.aiConfig);
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: quickTitle,
      description: '',
      dueDate: null,
      status: 'todo',
      priority: 'medium',
      tags: [],
      category: 'General',
      subtasks: [],
    };

    await api.saveTask(task);
    setQuickTitle('');
    loadTasks();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      description: newTask.description || '',
      dueDate: newTask.dueDate || null,
      status: newTask.status || 'todo',
      priority: newTask.priority || 'medium',
      tags: [],
      category: 'General',
      subtasks: [],
    };

    await api.saveTask(task);
    setIsModalOpen(false);
    setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', subtasks: [] });
    loadTasks();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Abandon this task?')) {
      await api.deleteTask(id);
      loadTasks();
    }
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    const updatedTask = { ...task, status: newStatus };
    setTasks(prev => prev.map(t => (t.id === task.id ? updatedTask : t)));
    await api.saveTask(updatedTask);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    if (dragOverColumn !== status) setDragOverColumn(status);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedTaskId) return;
    const task = tasks.find(t => t.id === draggedTaskId);
    if (task && task.status !== newStatus) {
      await handleStatusChange(task, newStatus);
    }
    setDraggedTaskId(null);
  };

  const generateSubtasks = async (task: Task) => {
    if (!aiConfig?.geminiKey) {
      alert('Configure Gemini Key in Settings.');
      return;
    }
    setGeneratingFor(task.id);
    try {
      const ai = new GoogleGenAI({ apiKey: aiConfig.geminiKey });
      const prompt = `Break down this task into 3-5 sub-tasks: "${task.title}". Return JSON array of strings.`;
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      const text = response.text || '[]';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedSuggestions = JSON.parse(cleanJson);
      if (Array.isArray(parsedSuggestions)) {
        setSuggestions(prev => ({ ...prev, [task.id]: parsedSuggestions }));
        setExpandedTasks(prev => new Set(prev).add(task.id));
      }
    } catch (error) {
      console.error('AI Error', error);
    } finally {
      setGeneratingFor(null);
    }
  };

  const acceptSuggestion = async (task: Task, suggestionText: string) => {
    const newSubtask: Subtask = {
      id: Math.random().toString(36).substr(2, 9),
      title: suggestionText,
      isCompleted: false,
    };
    const updatedTask = { ...task, subtasks: [...(task.subtasks || []), newSubtask] };
    setTasks(tasks.map(t => (t.id === task.id ? updatedTask : t)));
    setSuggestions(prev => ({
      ...prev,
      [task.id]: prev[task.id].filter(s => s !== suggestionText),
    }));
    await api.saveTask(updatedTask);
  };

  const toggleSubtask = async (task: Task, subtaskId: string) => {
    const updatedSubtasks =
      task.subtasks?.map(st =>
        st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
      ) || [];
    const updatedTask = { ...task, subtasks: updatedSubtasks };
    setTasks(tasks.map(t => (t.id === task.id ? updatedTask : t)));
    await api.saveTask(updatedTask);
  };

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const activeTasks = tasks.filter(t => t.status !== 'done');

  return (
    <motion.div
      className="p-6 h-full flex flex-col max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sword className="text-white" />
          </motion.div>
          Task Log
          <span className="text-xs font-normal text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
            {activeTasks.length} Active
          </span>
        </h1>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-[#131316] p-1 rounded-lg border border-white/10">
            <motion.button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LayoutList size={18} />
            </motion.button>
            <motion.button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'kanban' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Kanban size={18} />
            </motion.button>
          </div>

          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white to-gray-400 text-white rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all font-bold text-xs uppercase tracking-wide shadow-lg shadow-white/25"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} /> New Task
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Add */}
      <motion.div
        className="mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <form
          onSubmit={handleQuickAdd}
          className="flex items-center gap-2 p-1.5 bg-[#131316] border border-white/10 rounded-xl focus-within:border-white/30 transition-colors"
        >
          <div className="flex-1 px-3">
            <input
              type="text"
              value={quickTitle}
              onChange={e => setQuickTitle(e.target.value)}
              placeholder="Add a new task..."
              className="w-full bg-transparent border-none text-white placeholder-slate-600 focus:ring-0 text-sm h-full py-2 outline-none"
            />
          </div>
          <motion.button
            type="submit"
            disabled={!quickTitle.trim()}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
              quickTitle.trim()
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-white/5 text-slate-600'
            }`}
            whileHover={quickTitle.trim() ? { scale: 1.02 } : {}}
            whileTap={quickTitle.trim() ? { scale: 0.98 } : {}}
          >
            Add
          </motion.button>
        </form>
      </motion.div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <motion.div
          className="bg-[#131316] rounded-xl border border-white/10 overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence>
            {tasks.map((task, index) => {
              const isExpanded = expandedTasks.has(task.id);
              const hasSubtasks = (task.subtasks?.length || 0) > 0 || suggestions[task.id]?.length > 0;
              const config = priorityConfig[task.priority];

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b last:border-0 border-white/5"
                >
                  <div className="flex flex-col p-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center w-full">
                      {/* Checkbox */}
                      <motion.button
                        onClick={() =>
                          handleStatusChange(task, task.status === 'done' ? 'todo' : 'done')
                        }
                        className={`w-5 h-5 rounded border flex items-center justify-center mr-4 transition-all ${
                          task.status === 'done'
                            ? 'bg-white border-white text-white'
                            : 'border-slate-600 hover:border-white'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {task.status === 'done' && <Check size={12} />}
                      </motion.button>

                      {/* Expand Toggle */}
                      {hasSubtasks && (
                        <motion.button
                          onClick={() => toggleExpanded(task.id)}
                          className="mr-2 text-slate-500 hover:text-white transition-colors"
                          whileHover={{ scale: 1.1 }}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </motion.button>
                      )}

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium truncate transition-all ${
                            task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 ml-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <span
                          className={`px-2 py-1 rounded text-[10px] border font-bold uppercase ${config.color} ${config.bg} ${config.border}`}
                        >
                          {task.priority}
                        </span>
                        <motion.button
                          onClick={() => generateSubtasks(task)}
                          disabled={generatingFor === task.id}
                          className="text-slate-500 hover:text-white transition-colors"
                          title="AI Sub-tasks"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {generatingFor === task.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Loader2 size={16} />
                            </motion.div>
                          ) : (
                            <Sparkles size={16} />
                          )}
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(task.id)}
                          className="text-slate-500 hover:text-red-500 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>

                    {/* AI Suggestions */}
                    <AnimatePresence>
                      {isExpanded && suggestions[task.id] && suggestions[task.id].length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 ml-9 p-3 rounded-lg bg-white/5 border border-white/20"
                        >
                          <div className="text-xs font-bold text-white uppercase mb-2 flex items-center gap-1">
                            <Sparkles size={12} /> AI Suggestions
                          </div>
                          <div className="space-y-1">
                            {suggestions[task.id].map((s, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex justify-between items-center text-sm text-slate-300 bg-black/20 p-2 rounded"
                              >
                                <span>{s}</span>
                                <motion.button
                                  onClick={() => acceptSuggestion(task, s)}
                                  className="text-emerald-400 hover:bg-emerald-900/30 p-1 rounded"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Plus size={14} />
                                </motion.button>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Subtasks */}
                    <AnimatePresence>
                      {isExpanded && task.subtasks && task.subtasks.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 ml-10 space-y-1"
                        >
                          {task.subtasks.map((st, idx) => (
                            <motion.div
                              key={st.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className="flex items-center gap-3 py-1"
                            >
                              <motion.button
                                onClick={() => toggleSubtask(task, st.id)}
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  st.isCompleted
                                    ? 'bg-white border-white text-white'
                                    : 'border-slate-600'
                                }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {st.isCompleted && <Check size={10} />}
                              </motion.button>
                              <span
                                className={`text-sm ${
                                  st.isCompleted ? 'text-slate-500 line-through' : 'text-slate-400'
                                }`}
                              >
                                {st.title}
                              </span>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="p-12 text-center">
              <Sparkles size={32} className="mx-auto mb-3 text-slate-600" />
              <p className="text-slate-500 text-sm">No tasks yet. Create your first one!</p>
            </div>
          )}
        </motion.div>
      ) : (
        /* Kanban View */
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {(['todo', 'in-progress', 'done'] as const).map((status, colIndex) => {
            const config = statusConfig[status];
            const columnTasks = tasks.filter(t => t.status === status);

            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIndex * 0.1 }}
                className={`flex flex-col h-full rounded-xl p-3 border transition-colors ${
                  dragOverColumn === status
                    ? 'bg-white/10 border-white/30'
                    : 'bg-[#131316] border-white/5'
                }`}
                onDragOver={e => handleDragOver(e, status)}
                onDrop={e => handleDrop(e, status)}
                onDragLeave={() => setDragOverColumn(null)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold text-xs tracking-wider uppercase ${config.color}`}>
                    {config.label}
                  </h3>
                  <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs text-slate-300">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  <AnimatePresence>
                    {columnTasks.map((task, index) => {
                      const pConfig = priorityConfig[task.priority];
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.03 }}
                          draggable
                          onDragStart={e => handleDragStart(e, task.id)}
                          className={`bg-[#0a0a0c] p-3 rounded-lg border border-white/10 hover:border-white/30 cursor-move ${
                            draggedTaskId === task.id ? 'opacity-50' : ''
                          }`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <GripVertical size={12} className="text-slate-600" />
                            <h4 className="font-medium text-slate-200 text-sm leading-snug flex-1 truncate">
                              {task.title}
                            </h4>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] border uppercase ${pConfig.color} ${pConfig.bg} ${pConfig.border}`}
                          >
                            {task.priority}
                          </span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create Modal */}
      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-[#131316] rounded-xl w-full max-w-md p-6 border border-white/10">
          <h2 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
            <Sword size={20} className="text-white" />
            New Task
          </h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Task Title
              </label>
              <input
                type="text"
                placeholder="What needs to be done?"
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white focus:border-white outline-none transition-colors"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Description
              </label>
              <textarea
                placeholder="Add details about this task..."
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white focus:border-white outline-none transition-colors resize-none min-h-[100px]"
                value={newTask.description || ''}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Priority
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(p => {
                  const config = priorityConfig[p];
                  return (
                    <motion.button
                      key={p}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold uppercase transition-all ${
                        newTask.priority === p
                          ? `${config.bg} ${config.border} ${config.color}`
                          : 'bg-black/20 border-white/10 text-slate-400'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {p}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <motion.button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold uppercase"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-white to-gray-400 text-white rounded-lg text-xs font-bold uppercase shadow-lg shadow-white/25"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create Quest
              </motion.button>
            </div>
          </form>
        </div>
      </ModalWrapper>
    </motion.div>
  );
};

