import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Task, AccentColor, Subtask, AiConfig } from '../types';
import { Plus, LayoutList, Kanban, Trash2, Calendar, Sparkles, Check, X, Loader2, Sword } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface TasksProps {
  accent: AccentColor;
}

export const Tasks: React.FC<TasksProps> = ({ accent }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AiConfig | null>(null);
  
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDueDate, setQuickDueDate] = useState('');

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '', description: '', priority: 'medium', status: 'todo', subtasks: []
  });

  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Task['status'] | null>(null);

  useEffect(() => {
    loadTasks();
    loadAiConfig();
  }, []);

  const loadTasks = async () => {
    const data = await api.getTasks();
    setTasks(data);
  };

  const loadAiConfig = async () => {
      const session = await api.getSession();
      setAiConfig(session.aiConfig);
  }

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: quickTitle,
      description: '',
      dueDate: quickDueDate || null,
      status: 'todo',
      priority: 'medium',
      tags: [],
      category: 'General',
      subtasks: []
    };

    await api.saveTask(task);
    setQuickTitle('');
    setQuickDueDate('');
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
      subtasks: []
    };
    await api.saveTask(task);
    setIsModalOpen(false);
    setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', subtasks: [] });
    loadTasks();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Abandon this quest?')) {
      await api.deleteTask(id);
      loadTasks();
    }
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    const updatedTask = { ...task, status: newStatus };
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
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
    if (!aiConfig?.geminiKey) { alert("Configure Gemini Key in Settings."); return; }
    setGeneratingFor(task.id);
    try {
        const ai = new GoogleGenAI({ apiKey: aiConfig.geminiKey });
        const prompt = `Break down this task into 3-5 sub-quests: "${task.title}". Return JSON array of strings.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const text = response.text || "[]";
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedSuggestions = JSON.parse(cleanJson);
        if (Array.isArray(parsedSuggestions)) setSuggestions(prev => ({ ...prev, [task.id]: parsedSuggestions }));
    } catch (error) { console.error("AI Error", error); } 
    finally { setGeneratingFor(null); }
  };

  const acceptSuggestion = async (task: Task, suggestionText: string) => {
    const newSubtask: Subtask = { id: Math.random().toString(36).substr(2, 9), title: suggestionText, isCompleted: false };
    const updatedTask = { ...task, subtasks: [...(task.subtasks || []), newSubtask] };
    setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    setSuggestions(prev => ({ ...prev, [task.id]: prev[task.id].filter(s => s !== suggestionText) }));
    await api.saveTask(updatedTask);
  };

  const toggleSubtask = async (task: Task, subtaskId: string) => {
      const updatedSubtasks = task.subtasks?.map(st => st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st) || [];
      const updatedTask = { ...task, subtasks: updatedSubtasks };
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
      await api.saveTask(updatedTask);
  };

  const priorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'text-red-400 border-red-900 bg-red-900/20';
      case 'medium': return 'text-amber-400 border-amber-900 bg-amber-900/20';
      default: return 'text-emerald-400 border-emerald-900 bg-emerald-900/20';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
           <Sword className={`text-${accent}-500`} /> Quest Log 
           <span className="text-xs font-normal text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">{tasks.filter(t => t.status !== 'done').length} Active</span>
        </h1>
        <div className="flex items-center gap-2 bg-[#131316] p-1 rounded-lg border border-white/10">
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? `bg-white/10 text-white` : 'text-slate-500 hover:text-slate-300'}`}><LayoutList size={18} /></button>
          <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-md transition-all ${viewMode === 'kanban' ? `bg-white/10 text-white` : 'text-slate-500 hover:text-slate-300'}`}><Kanban size={18} /></button>
        </div>
        <button onClick={() => setIsModalOpen(true)} className={`flex items-center gap-2 px-4 py-2 bg-${accent}-600 text-white rounded-lg hover:bg-${accent}-700 transition-all font-bold text-xs uppercase tracking-wide`}><Plus size={16} /> New Quest</button>
      </div>

      {/* Quick Add */}
      <div className="mb-8">
        <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-[#131316] border border-white/10 rounded-xl focus-within:border-white/30 transition-colors">
            <div className="flex-1 px-3 w-full">
                <input type="text" value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} placeholder="Add a new side quest..." className="w-full bg-transparent border-none text-white placeholder-slate-600 focus:ring-0 text-sm h-full py-2" />
            </div>
            <button type="submit" disabled={!quickTitle.trim()} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${quickTitle.trim() ? `bg-${accent}-600 text-white` : 'bg-white/5 text-slate-600'}`}>Add</button>
        </form>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-[#131316] rounded-xl border border-white/10 overflow-hidden">
          {tasks.map((task) => (
            <div key={task.id} className="flex flex-col p-4 border-b last:border-0 border-white/5 hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center w-full">
                  <button onClick={() => handleStatusChange(task, task.status === 'done' ? 'todo' : 'done')} className={`w-5 h-5 rounded border flex items-center justify-center mr-4 transition-all ${task.status === 'done' ? `bg-${accent}-500 border-${accent}-500 text-white` : 'border-slate-600 hover:border-slate-400'}`}>{task.status === 'done' && <Check size={14} />}</button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate transition-all ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`px-2 py-1 rounded text-[10px] border font-bold uppercase ${priorityColor(task.priority)}`}>{task.priority}</span>
                    <button onClick={() => generateSubtasks(task)} disabled={generatingFor === task.id} className="text-slate-500 hover:text-white transition-colors" title="AI Sub-quests">{generatingFor === task.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}</button>
                    <button onClick={() => handleDelete(task.id)} className="text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
              </div>

              {suggestions[task.id] && suggestions[task.id].length > 0 && (
                  <div className="mt-4 ml-9 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Sparkles size={12} /> AI Suggestions</div>
                      <div className="space-y-1">{suggestions[task.id].map((s, idx) => (<div key={idx} className="flex justify-between items-center text-sm text-slate-300 bg-black/20 p-2 rounded"><span>{s}</span><button onClick={() => acceptSuggestion(task, s)} className="text-emerald-400 hover:bg-emerald-900/30 p-1 rounded"><Plus size={14}/></button></div>))}</div>
                  </div>
              )}

              {task.subtasks && task.subtasks.length > 0 && (
                  <div className="mt-3 ml-10 space-y-1">
                      {task.subtasks.map(st => (<div key={st.id} className="flex items-center gap-3 py-1"><button onClick={() => toggleSubtask(task, st.id)} className={`w-4 h-4 rounded border flex items-center justify-center ${st.isCompleted ? `bg-${accent}-500 border-${accent}-500 text-white` : 'border-slate-600'}`}>{st.isCompleted && <Check size={10} />}</button><span className={`text-sm ${st.isCompleted ? 'text-slate-500 line-through' : 'text-slate-400'}`}>{st.title}</span></div>))}
                  </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['todo', 'in-progress', 'done'] as const).map(status => (
            <div key={status} className={`flex flex-col h-full rounded-xl p-3 border transition-colors ${dragOverColumn === status ? `bg-${accent}-900/10 border-${accent}-500/30` : 'bg-[#131316] border-white/5'}`} onDragOver={(e) => { e.preventDefault(); setDragOverColumn(status); }} onDrop={(e) => handleDrop(e, status)} onDragLeave={() => setDragOverColumn(null)}>
              <h3 className="font-bold text-slate-400 mb-4 capitalize text-xs tracking-wider flex justify-between">{status.replace('-', ' ')} <span className="bg-white/10 px-2 rounded-full text-slate-300">{tasks.filter(t => t.status === status).length}</span></h3>
              <div className="space-y-3">
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} className={`bg-[#0a0a0c] p-3 rounded-lg border border-white/10 hover:border-white/20 cursor-move ${draggedTaskId === task.id ? 'opacity-50' : ''}`}>
                    <div className="flex justify-between items-start mb-2"><h4 className="font-medium text-slate-200 text-sm leading-snug">{task.title}</h4></div>
                    <span className={`px-2 py-0.5 rounded text-[9px] border uppercase ${priorityColor(task.priority)}`}>{task.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#131316] rounded-xl w-full max-w-md p-6 border border-white/10">
            <h2 className="text-lg font-bold mb-6 text-white">New Quest</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input type="text" placeholder="Quest Title" className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-indigo-500 outline-none" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} autoFocus />
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold uppercase">Cancel</button>
                <button type="submit" className={`px-6 py-2 bg-${accent}-600 text-white rounded-lg text-xs font-bold uppercase`}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};