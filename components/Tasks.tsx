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
  List,
  Calendar,
  Flag,
  Eye,
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { SpotlightCard, ModalWrapper, CardHover, Skeleton, ConfirmDialog } from './Animations';

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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [showChecklistInput, setShowChecklistInput] = useState(false);

  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Task['status'] | null>(null);
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editChecklistItem, setEditChecklistItem] = useState('');

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
      subtasks: newTask.subtasks || [], // Fixed: Include subtasks from newTask
    };

    await api.saveTask(task);
    setIsModalOpen(false);
    setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', subtasks: [] });
    setShowChecklistInput(false);
    setNewChecklistItem('');
    loadTasks();
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Task?',
      message: 'This task will be permanently removed. This action cannot be undone.',
      onConfirm: async () => {
        await api.deleteTask(id);
        loadTasks();
      }
    });
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

  // Add checklist item to new task
  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const newSubtask: Subtask = {
      id: Math.random().toString(36).substr(2, 9),
      title: newChecklistItem.trim(),
      isCompleted: false,
    };
    setNewTask(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), newSubtask],
    }));
    setNewChecklistItem('');
  };

  // Remove checklist item from new task
  const handleRemoveChecklistItem = (subtaskId: string) => {
    setNewTask(prev => ({
      ...prev,
      subtasks: (prev.subtasks || []).filter(st => st.id !== subtaskId),
    }));
  };

  // Open task detail modal
  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  // Delete subtask from existing task
  const deleteSubtask = async (task: Task, subtaskId: string) => {
    const updatedSubtasks = task.subtasks?.filter(st => st.id !== subtaskId) || [];
    const updatedTask = { ...task, subtasks: updatedSubtasks };
    setTasks(tasks.map(t => (t.id === task.id ? updatedTask : t)));
    if (selectedTask?.id === task.id) {
      setSelectedTask(updatedTask);
    }
    if (editingTask?.id === task.id) {
      setEditingTask(updatedTask);
    }
    await api.saveTask(updatedTask);
  };

  // Start editing task
  const startEditing = () => {
    if (selectedTask) {
      setEditingTask({ ...selectedTask });
      setIsEditing(true);
    }
  };

  // Save edited task
  const saveEditedTask = async () => {
    if (!editingTask) return;
    await api.saveTask(editingTask);
    setTasks(tasks.map(t => (t.id === editingTask.id ? editingTask : t)));
    setSelectedTask(editingTask);
    setIsEditing(false);
    setEditingTask(null);
    setEditChecklistItem('');
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingTask(null);
    setEditChecklistItem('');
  };

  // Add checklist item while editing
  const addEditChecklistItem = () => {
    if (!editChecklistItem.trim() || !editingTask) return;
    const newSubtask: Subtask = {
      id: Math.random().toString(36).substr(2, 9),
      title: editChecklistItem.trim(),
      isCompleted: false,
    };
    setEditingTask({
      ...editingTask,
      subtasks: [...(editingTask.subtasks || []), newSubtask],
    });
    setEditChecklistItem('');
  };

  // Remove checklist item while editing
  const removeEditChecklistItem = (subtaskId: string) => {
    if (!editingTask) return;
    setEditingTask({
      ...editingTask,
      subtasks: editingTask.subtasks?.filter(st => st.id !== subtaskId) || [],
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
                      const hasSubtasks = (task.subtasks?.length || 0) > 0;
                      const completedSubtasks = task.subtasks?.filter(st => st.isCompleted).length || 0;
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.03 }}
                          draggable
                          onDragStart={e => handleDragStart(e, task.id)}
                          className={`bg-[#0a0a0c] p-3 rounded-lg border border-white/10 hover:border-white/30 cursor-pointer group ${
                            draggedTaskId === task.id ? 'opacity-50' : ''
                          }`}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => openTaskDetail(task)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="cursor-move text-slate-600 hover:text-slate-400"
                              onClick={e => e.stopPropagation()}
                            >
                              <GripVertical size={12} />
                            </div>
                            <h4 className="font-medium text-slate-200 text-sm leading-snug flex-1">
                              {task.title}
                            </h4>
                            <Eye size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          
                          {/* Description Preview */}
                          {task.description && (
                            <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Footer: Priority & Subtasks */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] border uppercase ${pConfig.color} ${pConfig.bg} ${pConfig.border}`}
                            >
                              {task.priority}
                            </span>
                            {hasSubtasks && (
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Check size={10} />
                                {completedSubtasks}/{task.subtasks?.length}
                              </span>
                            )}
                          </div>
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
        <ModalWrapper isOpen={isModalOpen} onClose={() => {
          setIsModalOpen(false);
          setShowChecklistInput(false);
          setNewChecklistItem('');
        }}>
            <div className="bg-[#131316] rounded-2xl w-full max-w-6xl p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Sword size={28} className="text-white" />
                        New Quest
                    </h2>
                    <button onClick={() => {
                      setIsModalOpen(false);
                      setShowChecklistInput(false);
                      setNewChecklistItem('');
                    }} className="text-slate-500 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleCreateTask}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* SOL TARAF (Geniş alan) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase mb-2">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="What is your main objective?"
                                    className="w-full px-5 py-4 rounded-xl bg-black/30 border border-white/10 text-white text-xl focus:border-white outline-none transition-colors placeholder:text-slate-600 font-medium"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase mb-2">
                                    Description & Details
                                </label>
                                <textarea
                                    placeholder="Describe the quest details..."
                                    className="w-full px-5 py-4 rounded-xl bg-black/30 border border-white/10 text-white text-base focus:border-white outline-none transition-colors resize-none h-[180px] placeholder:text-slate-600 leading-relaxed"
                                    value={newTask.description || ''}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>

                            {/* Checklist / Maddeler Bölümü */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                                        <List size={16} />
                                        Checklist Items
                                    </label>
                                    {!showChecklistInput && (
                                        <motion.button
                                            type="button"
                                            onClick={() => setShowChecklistInput(true)}
                                            className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Plus size={14} />
                                            Add Item
                                        </motion.button>
                                    )}
                                </div>

                                {/* Mevcut Maddeler */}
                                {(newTask.subtasks?.length || 0) > 0 && (
                                    <div className="space-y-2 mb-3">
                                        {newTask.subtasks?.map((subtask, index) => (
                                            <motion.div
                                                key={subtask.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5 group"
                                            >
                                                <div className="w-5 h-5 rounded border border-slate-600 flex items-center justify-center text-slate-500">
                                                    {index + 1}
                                                </div>
                                                <span className="flex-1 text-sm text-slate-300">{subtask.title}</span>
                                                <motion.button
                                                    type="button"
                                                    onClick={() => handleRemoveChecklistItem(subtask.id)}
                                                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <X size={14} />
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* Yeni Madde Ekleme */}
                                <AnimatePresence>
                                    {showChecklistInput && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <input
                                                type="text"
                                                placeholder="Enter a checklist item..."
                                                value={newChecklistItem}
                                                onChange={e => setNewChecklistItem(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddChecklistItem();
                                                    }
                                                }}
                                                className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-white outline-none transition-colors placeholder:text-slate-600"
                                            />
                                            <motion.button
                                                type="button"
                                                onClick={handleAddChecklistItem}
                                                disabled={!newChecklistItem.trim()}
                                                className={`p-3 rounded-lg transition-all ${
                                                    newChecklistItem.trim()
                                                        ? 'bg-white text-black hover:bg-gray-200'
                                                        : 'bg-white/10 text-slate-600'
                                                }`}
                                                whileHover={newChecklistItem.trim() ? { scale: 1.05 } : {}}
                                                whileTap={newChecklistItem.trim() ? { scale: 0.95 } : {}}
                                            >
                                                <Plus size={16} />
                                            </motion.button>
                                            <motion.button
                                                type="button"
                                                onClick={() => {
                                                    setShowChecklistInput(false);
                                                    setNewChecklistItem('');
                                                }}
                                                className="p-3 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <X size={16} />
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {(newTask.subtasks?.length || 0) === 0 && !showChecklistInput && (
                                    <div className="text-center py-6 text-slate-600 text-sm border border-dashed border-white/10 rounded-xl">
                                        No checklist items yet. Click "Add Item" to get started.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SAĞ TARAF (Dar alan - Ayarlar) */}
                        <div className="space-y-6 lg:border-l lg:border-white/5 lg:pl-8 flex flex-col">

                            {/* Priority Seçimi */}
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <Flag size={14} />
                                    Priority Level
                                </label>
                                <div className="flex flex-col gap-3">
                                    {(['low', 'medium', 'high'] as const).map(p => {
                                        const config = priorityConfig[p];
                                        const isSelected = newTask.priority === p;
                                        return (
                                            <motion.button
                                                key={p}
                                                type="button"
                                                onClick={() => setNewTask({ ...newTask, priority: p })}
                                                className={`w-full py-3 rounded-xl border text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                                                    isSelected
                                                        ? `${config.bg} ${config.border} ${config.color} ring-1 ring-white/20`
                                                        : 'bg-black/20 border-white/5 text-slate-500 hover:bg-white/5'
                                                }`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {isSelected && <Check size={14} />}
                                                {p}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <Calendar size={14} />
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={newTask.dueDate || ''}
                                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value || null })}
                                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:border-white outline-none transition-colors"
                                />
                            </div>

                            {/* Aksiyon Butonları */}
                            <div className="mt-auto pt-6 flex flex-col gap-3">
                                <motion.button
                                    type="submit"
                                    className="w-full py-4 bg-white text-black rounded-xl text-sm font-bold uppercase shadow-lg shadow-white/10 hover:bg-gray-200 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Create Task
                                </motion.button>
                                <motion.button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setShowChecklistInput(false);
                                        setNewChecklistItem('');
                                    }}
                                    className="w-full py-3 text-slate-500 hover:text-white text-xs font-bold uppercase transition-colors"
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </ModalWrapper>

        {/* Task Detail Modal */}
        <ModalWrapper isOpen={isDetailModalOpen} onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
          setIsEditing(false);
          setEditingTask(null);
          setEditChecklistItem('');
        }}>
            {selectedTask && (
                <div className="bg-[#131316] rounded-2xl w-full max-w-5xl p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
                    {isEditing && editingTask ? (
                        // Edit Mode
                        <>
                            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <Sword size={24} className="text-white" />
                                    Edit Task
                                </h2>
                                <button 
                                    onClick={cancelEditing}
                                    className="text-slate-500 hover:text-white p-1"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Side - Main Content */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={editingTask.title}
                                            onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl bg-black/30 border border-white/10 text-white text-xl focus:border-white outline-none transition-colors font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Description</label>
                                        <textarea
                                            value={editingTask.description}
                                            onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl bg-black/30 border border-white/10 text-white text-base focus:border-white outline-none transition-colors resize-none h-[150px] leading-relaxed"
                                            placeholder="Add description..."
                                        />
                                    </div>

                                    {/* Checklist Editing */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                            <List size={14} />
                                            Checklist Items
                                        </label>
                                        
                                        {(editingTask.subtasks?.length || 0) > 0 && (
                                            <div className="space-y-2 mb-3">
                                                {editingTask.subtasks?.map((subtask, index) => (
                                                    <motion.div
                                                        key={subtask.id}
                                                        className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5 group"
                                                    >
                                                        <div className="w-5 h-5 rounded border border-slate-600 flex items-center justify-center text-slate-500 text-xs">
                                                            {index + 1}
                                                        </div>
                                                        <span className="flex-1 text-sm text-slate-300">{subtask.title}</span>
                                                        <motion.button
                                                            type="button"
                                                            onClick={() => removeEditChecklistItem(subtask.id)}
                                                            className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <X size={14} />
                                                        </motion.button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add new checklist item..."
                                                value={editChecklistItem}
                                                onChange={e => setEditChecklistItem(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addEditChecklistItem();
                                                    }
                                                }}
                                                className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-white outline-none transition-colors placeholder:text-slate-600"
                                            />
                                            <motion.button
                                                type="button"
                                                onClick={addEditChecklistItem}
                                                disabled={!editChecklistItem.trim()}
                                                className={`p-3 rounded-lg transition-all ${
                                                    editChecklistItem.trim()
                                                        ? 'bg-white text-black hover:bg-gray-200'
                                                        : 'bg-white/10 text-slate-600'
                                                }`}
                                                whileHover={editChecklistItem.trim() ? { scale: 1.05 } : {}}
                                                whileTap={editChecklistItem.trim() ? { scale: 0.95 } : {}}
                                            >
                                                <Plus size={16} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Settings */}
                                <div className="space-y-6 lg:border-l lg:border-white/5 lg:pl-8 flex flex-col">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                            <Flag size={14} />
                                            Priority
                                        </label>
                                        <div className="flex flex-col gap-2">
                                            {(['low', 'medium', 'high'] as const).map(p => {
                                                const config = priorityConfig[p];
                                                const isSelected = editingTask.priority === p;
                                                return (
                                                    <motion.button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setEditingTask({ ...editingTask, priority: p })}
                                                        className={`w-full py-2.5 rounded-xl border text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                                                            isSelected
                                                                ? `${config.bg} ${config.border} ${config.color}`
                                                                : 'bg-black/20 border-white/5 text-slate-500 hover:bg-white/5'
                                                        }`}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        {isSelected && <Check size={12} />}
                                                        {p}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                            <Calendar size={14} />
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            value={editingTask.dueDate || ''}
                                            onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value || null })}
                                            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:border-white outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="mt-auto pt-6 flex flex-col gap-3">
                                        <motion.button
                                            onClick={saveEditedTask}
                                            className="w-full py-4 bg-white text-black rounded-xl text-sm font-bold uppercase shadow-lg shadow-white/10 hover:bg-gray-200 transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Save Changes
                                        </motion.button>
                                        <motion.button
                                            onClick={cancelEditing}
                                            className="w-full py-3 text-slate-500 hover:text-white text-xs font-bold uppercase transition-colors"
                                        >
                                            Cancel
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        // View Mode
                        <>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6 gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`px-2.5 py-1 rounded text-[10px] border uppercase font-bold ${priorityConfig[selectedTask.priority].color} ${priorityConfig[selectedTask.priority].bg} ${priorityConfig[selectedTask.priority].border}`}>
                                            {selectedTask.priority}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold ${statusConfig[selectedTask.status].color} ${statusConfig[selectedTask.status].bg}`}>
                                            {statusConfig[selectedTask.status].label}
                                        </span>
                                        {selectedTask.dueDate && (
                                            <span className="px-2.5 py-1 rounded text-[10px] uppercase font-bold text-slate-400 bg-slate-500/10 flex items-center gap-1">
                                                <Calendar size={10} />
                                                {selectedTask.dueDate}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">{selectedTask.title}</h2>
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsDetailModalOpen(false);
                                        setSelectedTask(null);
                                    }} 
                                    className="text-slate-500 hover:text-white p-1"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Description</h3>
                                {selectedTask.description ? (
                                    <p className="text-slate-300 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                                        {selectedTask.description}
                                    </p>
                                ) : (
                                    <p className="text-slate-600 italic bg-black/20 p-4 rounded-xl border border-white/5">
                                        No description added.
                                    </p>
                                )}
                            </div>

                            {/* Subtasks */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                                        <List size={14} />
                                        Checklist ({selectedTask.subtasks?.filter(st => st.isCompleted).length || 0}/{selectedTask.subtasks?.length || 0})
                                    </h3>
                                </div>
                                
                                {(selectedTask.subtasks?.length || 0) > 0 ? (
                                    <div className="space-y-2">
                                        {selectedTask.subtasks?.map((subtask) => (
                                            <motion.div
                                                key={subtask.id}
                                                className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5 group"
                                            >
                                                <motion.button
                                                    onClick={async () => {
                                                        await toggleSubtask(selectedTask, subtask.id);
                                                        setSelectedTask(prev => prev ? {
                                                            ...prev,
                                                            subtasks: prev.subtasks?.map(st =>
                                                                st.id === subtask.id ? { ...st, isCompleted: !st.isCompleted } : st
                                                            )
                                                        } : null);
                                                    }}
                                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                                        subtask.isCompleted
                                                            ? 'bg-white border-white text-black'
                                                            : 'border-slate-600 hover:border-white'
                                                    }`}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    {subtask.isCompleted && <Check size={12} />}
                                                </motion.button>
                                                <span className={`flex-1 text-sm ${
                                                    subtask.isCompleted ? 'text-slate-500 line-through' : 'text-slate-300'
                                                }`}>
                                                    {subtask.title}
                                                </span>
                                                <motion.button
                                                    onClick={() => deleteSubtask(selectedTask, subtask.id)}
                                                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Trash2 size={14} />
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-slate-600 text-sm border border-dashed border-white/10 rounded-xl">
                                        No checklist items for this task.
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                <select
                                    value={selectedTask.status}
                                    onChange={async (e) => {
                                        const newStatus = e.target.value as Task['status'];
                                        await handleStatusChange(selectedTask, newStatus);
                                        setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
                                    }}
                                    className="px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:border-white outline-none transition-colors"
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="done">Completed</option>
                                </select>
                                <motion.button
                                    onClick={startEditing}
                                    className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold uppercase border border-white/10 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Edit Task
                                </motion.button>
                                <motion.button
                                    onClick={() => {
                                        handleDelete(selectedTask.id);
                                        setIsDetailModalOpen(false);
                                        setSelectedTask(null);
                                    }}
                                    className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl text-sm font-bold uppercase border border-red-500/30 hover:bg-red-500/30 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Trash2 size={16} />
                                </motion.button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </ModalWrapper>

        {/* Confirm Dialog */}
        <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            onConfirm={confirmDialog.onConfirm}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
        />
    </motion.div>
  );
};

