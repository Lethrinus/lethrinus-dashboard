
import { supabase } from './supabase';
import { AppState, JournalEntry, Task, Note, FileItem, MediaItem, User, ThemeMode, AccentColor, AiConfig } from '../types';

// We will use LocalStorage for UI preferences (Theme, Accent, AI Config)
// to keep the Database schema simple for now.
const PREFS_KEY = 'lethrinus_prefs_v1';

interface LocalPrefs {
    theme: ThemeMode;
    accent: AccentColor;
    aiConfig: AiConfig;
}

const DEFAULT_PREFS: LocalPrefs = {
    theme: 'dark',
    accent: 'violet',
    aiConfig: {
        preferredModel: 'gemini',
        geminiKey: "",
        openaiKey: "",
        anthropicKey: ""
    }
};

class ApiService {

    // --- Helpers ---

    private getPrefs(): LocalPrefs {
        const stored = localStorage.getItem(PREFS_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_PREFS;
    }

    private savePrefs(prefs: Partial<LocalPrefs>) {
        const current = this.getPrefs();
        localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
    }

    // --- Auth ---

    async login(email: string, password: string): Promise<User> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        if (!data.user) throw new Error("No user data returned");

        // Fetch or create profile
        let { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        return {
            id: data.user.id,
            email: data.user.email!,
            name: profile?.name || data.user.email!.split('@')[0],
        };
    }

    async logout(): Promise<void> {
        await supabase.auth.signOut();
    }

    async getSession(): Promise<{ user: User | null; theme: ThemeMode; accent: AccentColor; aiConfig: AiConfig }> {
        const { data: { session } } = await supabase.auth.getSession();

        let user: User | null = null;
        if (session?.user) {
            // Try to get profile name
            const { data: profile } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', session.user.id)
                .single();

            user = {
                id: session.user.id,
                email: session.user.email!,
                name: profile?.name || session.user.email!.split('@')[0],
            };
        }

        const prefs = this.getPrefs();

        return {
            user,
            theme: prefs.theme,
            accent: prefs.accent,
            aiConfig: prefs.aiConfig
        };
    }

    // --- Settings ---

    async updateSettings(theme: ThemeMode, accent: AccentColor): Promise<void> {
        this.savePrefs({ theme, accent });
    }

    async updateAiConfig(config: AiConfig): Promise<void> {
        this.savePrefs({ aiConfig: config });
    }

    // --- Journal ---

    async getJournalEntries(): Promise<JournalEntry[]> {
        const { data, error } = await supabase
            .from('journal')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;

        // Map snake_case DB to camelCase Types
        return (data || []).map((row: any) => ({
            id: row.id,
            date: row.date,
            title: row.title,
            content: row.content,
            mood: row.mood,
            tags: row.tags || [],
            images: row.images || [],
            spotifyEmbed: row.spotify_embed,
            createdAt: new Date(row.created_at).getTime()
        }));
    }

    async saveJournalEntry(entry: JournalEntry): Promise<JournalEntry> {
        // Check if ID is a UUID (Supabase uses UUIDs). If it's a temp Math.random ID, we let Supabase generate a new one or handle upsert logic.
        // For simplicity, we assume 'entry.id' from the frontend might be temporary if it's new.

        const payload = {
            date: entry.date,
            title: entry.title,
            content: entry.content,
            mood: entry.mood,
            tags: entry.tags,
            images: entry.images,
            spotify_embed: entry.spotifyEmbed,
            user_id: (await supabase.auth.getUser()).data.user?.id
        };

        let result;

        // Check if UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entry.id);

        if (isUuid) {
            // Update existing
            const { data, error } = await supabase
                .from('journal')
                .update(payload)
                .eq('id', entry.id)
                .select()
                .single();
            if (error) throw error;
            result = data;
        } else {
            // Insert new
            const { data, error } = await supabase
                .from('journal')
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            result = data;
        }

        return {
            ...entry,
            id: result.id,
            createdAt: new Date(result.created_at).getTime()
        };
    }

    // --- Tasks ---

    async getTasks(): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any) => ({
            id: row.id,
            title: row.title,
            description: row.description || '',
            dueDate: row.due_date,
            status: row.status,
            priority: row.priority,
            tags: row.tags || [],
            category: row.category || 'General',
            subtasks: row.subtasks || []
        }));
    }

    async saveTask(task: Task): Promise<Task> {
        const payload = {
            title: task.title,
            description: task.description,
            due_date: task.dueDate,
            status: task.status,
            priority: task.priority,
            tags: task.tags,
            category: task.category,
            subtasks: task.subtasks,
            user_id: (await supabase.auth.getUser()).data.user?.id
        };

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(task.id);
        let result;

        if (isUuid) {
            const { data, error } = await supabase.from('tasks').update(payload).eq('id', task.id).select().single();
            if(error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase.from('tasks').insert(payload).select().single();
            if(error) throw error;
            result = data;
        }

        return {
            ...task,
            id: result.id
        };
    }

    async deleteTask(id: string): Promise<void> {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
    }

    // --- Notes ---

    async getNotes(): Promise<Note[]> {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any) => ({
            id: row.id,
            title: row.title,
            content: row.content,
            folderId: row.folder_id,
            isPinned: row.is_pinned,
            updatedAt: new Date(row.updated_at).getTime()
        }));
    }

    async saveNote(note: Note): Promise<Note> {
        const payload = {
            title: note.title,
            content: note.content,
            folder_id: note.folderId,
            is_pinned: note.isPinned,
            updated_at: new Date().toISOString(),
            user_id: (await supabase.auth.getUser()).data.user?.id
        };

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(note.id);
        let result;

        if (isUuid) {
            const { data, error } = await supabase.from('notes').update(payload).eq('id', note.id).select().single();
            if(error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase.from('notes').insert(payload).select().single();
            if(error) throw error;
            result = data;
        }

        return { ...note, id: result.id };
    }

    async deleteNote(id: string): Promise<void> {
        const { error } = await supabase.from('notes').delete().eq('id', id);
        if (error) throw error;
    }

    // --- Files ---
    // Note: For a complete implementation, this would interact with Supabase Storage buckets.
    // For now, we will assume a metadata table 'files' exists as described in the DB plan.

    async getFiles(): Promise<FileItem[]> {
        // If 'files' table doesn't exist yet, we return empty to prevent crash
        const { data, error } = await supabase.from('files').select('*');
        if (error) {
            console.warn("Could not fetch files (Table might not exist yet)", error);
            return [];
        }

        return (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            folderId: row.folder_id,
            type: row.type,
            size: row.size,
            mimeType: row.mime_type,
            uploadDate: new Date(row.created_at).getTime()
        }));
    }

    async createFolder(name: string, parentId: string | null): Promise<FileItem> {
        const payload = {
            name,
            folder_id: parentId,
            type: 'folder',
            user_id: (await supabase.auth.getUser()).data.user?.id
        };
        const { data, error } = await supabase.from('files').insert(payload).select().single();
        if(error) throw error;

        return {
            id: data.id,
            name: data.name,
            folderId: data.folder_id,
            type: 'folder',
            uploadDate: Date.now()
        };
    }

    async uploadFile(name: string, size: number, mimeType: string, parentId: string | null): Promise<FileItem> {
        // NOTE: This only creates metadata. Real file upload to Storage Bucket would happen here.
        const payload = {
            name,
            size,
            mime_type: mimeType,
            folder_id: parentId,
            type: 'file',
            user_id: (await supabase.auth.getUser()).data.user?.id
        };
        const { data, error } = await supabase.from('files').insert(payload).select().single();
        if(error) throw error;

        return {
            id: data.id,
            name: data.name,
            folderId: data.folder_id,
            type: 'file',
            size: data.size,
            mimeType: data.mime_type,
            uploadDate: Date.now()
        };
    }

    async deleteFileItem(id: string): Promise<void> {
        const { error } = await supabase.from('files').delete().eq('id', id);
        if(error) throw error;
    }

    // --- Media ---

    async getMedia(): Promise<MediaItem[]> {
        const { data, error } = await supabase.from('media').select('*');
        if (error) {
            console.warn("Could not fetch media", error);
            return [];
        }
        return (data || []).map((row: any) => ({
            id: row.id,
            title: row.title,
            type: row.type,
            status: row.status,
            rating: row.rating,
            year: row.year,
            image: row.image
        }));
    }

    async saveMedia(item: MediaItem): Promise<MediaItem> {
        const payload = {
            title: item.title,
            type: item.type,
            status: item.status,
            rating: item.rating,
            year: item.year,
            image: item.image,
            user_id: (await supabase.auth.getUser()).data.user?.id
        };

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
        let result;

        if (isUuid) {
            const { data, error } = await supabase.from('media').update(payload).eq('id', item.id).select().single();
            if(error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase.from('media').insert(payload).select().single();
            if(error) throw error;
            result = data;
        }

        return { ...item, id: result.id };
    }

    async deleteMedia(id: string): Promise<void> {
        const { error } = await supabase.from('media').delete().eq('id', id);
        if(error) throw error;
    }
}

export const api = new ApiService();
