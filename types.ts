
export type ThemeMode = 'light' | 'dark';
export type AccentColor = 'blue' | 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  title: string;
  content: string;
  mood: 'happy' | 'neutral' | 'sad' | 'productive' | 'tired';
  tags: string[];
  images?: string[]; // Array of Base64 strings or URLs
  spotifyEmbed?: string; // Spotify Embed URL
  createdAt: number;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  category: string;
  subtasks: Subtask[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  isPinned: boolean;
  updatedAt: number;
}

export interface FileItem {
  id: string;
  name: string;
  folderId: string | null;
  type: 'file' | 'folder';
  size?: number; // bytes
  mimeType?: string;
  uploadDate: number;
  storagePath?: string; // Supabase Storage path
  publicUrl?: string; // Public URL for the file
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'series';
  status: 'watching' | 'completed' | 'plan';
  rating: number; // 0-5
  image?: string; // Poster URL
  year?: string;
}

export interface AiConfig {
  geminiKey: string;
  openaiKey: string;
  anthropicKey: string;
  preferredModel: 'gemini' | 'gpt4' | 'claude';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AppState {
  user: User | null;
  theme: ThemeMode;
  accent: AccentColor;
  journal: JournalEntry[];
  tasks: Task[];
  notes: Note[];
  files: FileItem[];
  media: MediaItem[];
  aiConfig: AiConfig;
}
