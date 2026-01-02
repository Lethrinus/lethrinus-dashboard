
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.warn('No authenticated user, returning empty journal entries');
            return [];
        }

        const { data, error } = await supabase
            .from('journal')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (error) {
            console.error('Failed to fetch journal entries:', error);
            throw error;
        }

        // Map snake_case DB to camelCase Types
        return (data || []).map((row: any) => ({
            id: row.id,
            date: row.date,
            title: row.title || '',
            content: row.content || '',
            mood: row.mood || 'neutral',
            tags: row.tags || [],
            images: row.images || [],
            spotifyEmbed: row.spotify_embed || '',
            createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
        }));
    }

    async saveJournalEntry(entry: JournalEntry): Promise<JournalEntry> {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error('You must be logged in to save journal entries');
        }

        // Ensure user_id is valid UUID
        if (!user.id || typeof user.id !== 'string') {
            throw new Error('Invalid user session. Please log in again.');
        }

        const payload: any = {
            date: entry.date,
            title: entry.title || '',
            content: entry.content || '',
            mood: entry.mood || 'neutral',
            tags: entry.tags || [],
            images: entry.images || [],
            spotify_embed: entry.spotifyEmbed || '',
            user_id: user.id
        };

        let result;

        // Check if UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entry.id);

        if (isUuid) {
            // Update existing - also check user_id for security
            const { data, error } = await supabase
                .from('journal')
                .update(payload)
                .eq('id', entry.id)
                .eq('user_id', user.id)
                .select()
                .single();
            if (error) {
                console.error('Failed to update journal entry:', error);
                throw error;
            }
            if (!data) {
                throw new Error('Journal entry not found or access denied');
            }
            result = data;
        } else {
            // Insert new
            const { data, error } = await supabase
                .from('journal')
                .insert(payload)
                .select()
                .single();
            if (error) {
                console.error('Failed to create journal entry:', error);
                throw error;
            }
            result = data;
        }

        return {
            ...entry,
            id: result.id,
            date: result.date,
            title: result.title || '',
            content: result.content || '',
            mood: result.mood || 'neutral',
            tags: result.tags || [],
            images: result.images || [],
            spotifyEmbed: result.spotify_embed || '',
            createdAt: result.created_at ? new Date(result.created_at).getTime() : Date.now()
        };
    }

    async deleteJournalEntry(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('You must be logged in to delete journal entries');
        }

        const { error } = await supabase
            .from('journal')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Failed to delete journal entry:', error);
            throw error;
        }
    }

    // --- Tasks ---

    async getTasks(): Promise<Task[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.warn('No authenticated user, returning empty tasks');
            return [];
        }

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch tasks:', error);
            throw error;
        }

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('You must be logged in to save tasks');
        }

        const payload: any = {
            title: task.title,
            description: task.description || '',
            due_date: task.dueDate,
            status: task.status,
            priority: task.priority,
            tags: task.tags || [],
            category: task.category || 'General',
            subtasks: task.subtasks || [],
            user_id: user.id
        };

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(task.id);
        let result;

        if (isUuid) {
            const { data, error } = await supabase
                .from('tasks')
                .update(payload)
                .eq('id', task.id)
                .eq('user_id', user.id)
                .select()
                .single();
            if (error) {
                console.error('Failed to update task:', error);
                throw error;
            }
            if (!data) {
                throw new Error('Task not found or access denied');
            }
            result = data;
        } else {
            const { data, error } = await supabase
                .from('tasks')
                .insert(payload)
                .select()
                .single();
            if (error) {
                console.error('Failed to create task:', error);
                throw error;
            }
            result = data;
        }

        return {
            ...task,
            id: result.id
        };
    }

    async deleteTask(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('You must be logged in to delete tasks');
        }

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) {
            console.error('Failed to delete task:', error);
            throw error;
        }
    }

    // --- Notes ---

    async getNotes(): Promise<Note[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.warn('No authenticated user, returning empty notes');
            return [];
        }

        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch notes:', error);
            throw error;
        }

        return (data || []).map((row: any) => ({
            id: row.id,
            title: row.title || '',
            content: row.content || '',
            folderId: row.folder_id,
            isPinned: row.is_pinned || false,
            updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
        }));
    }

    async saveNote(note: Note): Promise<Note> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('You must be logged in to save notes');
        }

        const payload: any = {
            title: note.title || '',
            content: note.content || '',
            folder_id: note.folderId,
            is_pinned: note.isPinned || false,
            updated_at: new Date().toISOString(),
            user_id: user.id
        };

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(note.id);
        let result;

        if (isUuid) {
            const { data, error } = await supabase
                .from('notes')
                .update(payload)
                .eq('id', note.id)
                .eq('user_id', user.id)
                .select()
                .single();
            if (error) {
                console.error('Failed to update note:', error);
                throw error;
            }
            if (!data) {
                throw new Error('Note not found or access denied');
            }
            result = data;
        } else {
            const { data, error } = await supabase
                .from('notes')
                .insert(payload)
                .select()
                .single();
            if (error) {
                console.error('Failed to create note:', error);
                throw error;
            }
            result = data;
        }

        return {
            ...note,
            id: result.id,
            updatedAt: result.updated_at ? new Date(result.updated_at).getTime() : Date.now()
        };
    }

    async deleteNote(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('You must be logged in to delete notes');
        }

        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) {
            console.error('Failed to delete note:', error);
            throw error;
        }
    }

    // --- Files ---
    // Note: For a complete implementation, this would interact with Supabase Storage buckets.
    // For now, we will assume a metadata table 'files' exists as described in the DB plan.

    async getFiles(): Promise<FileItem[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.warn('No authenticated user, returning empty files');
            return [];
        }

        // If 'files' table doesn't exist yet, we return empty to prevent crash
        const { data, error } = await supabase
            .from('files')
            .select('*')
            .eq('user_id', user.id);
        if (error) {
            console.warn("Could not fetch files (Table might not exist yet)", error);
            return [];
        }

        // Generate signed URLs for all files with storage paths
        const filesWithUrls = await Promise.all((data || []).map(async (row: any) => {
            let signedUrl: string | undefined;
            
            // Only generate signed URL for files (not folders) with storage path
            if (row.type === 'file' && row.storage_path) {
                try {
                    const { data: urlData, error: urlError } = await supabase.storage
                        .from('files')
                        .createSignedUrl(row.storage_path, 60 * 60); // 1 hour expiry
                    
                    if (!urlError && urlData) {
                        signedUrl = urlData.signedUrl;
                    }
                } catch (e) {
                    console.warn('Failed to generate signed URL for:', row.name);
                }
            }

            return {
                id: row.id,
                name: row.name,
                folderId: row.folder_id,
                type: row.type,
                size: row.size,
                mimeType: row.mime_type,
                uploadDate: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
                storagePath: row.storage_path,
                publicUrl: signedUrl
            };
        }));

        return filesWithUrls;
    }

    async createFolder(name: string, parentId: string | null): Promise<FileItem> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('You must be logged in to create folders');
        }

        const payload = {
            name,
            folder_id: parentId,
            type: 'folder',
            user_id: user.id
        };
        const { data, error } = await supabase
            .from('files')
            .insert(payload)
            .select()
            .single();
        if (error) {
            console.error('Failed to create folder:', error);
            throw error;
        }

        return {
            id: data.id,
            name: data.name,
            folderId: data.folder_id,
            type: 'folder',
            uploadDate: data.created_at ? new Date(data.created_at).getTime() : Date.now()
        };
    }

    async uploadFile(file: File, parentId: string | null): Promise<FileItem> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('You must be logged in to upload files');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = parentId ? `${parentId}/${fileName}` : fileName;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('files')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Failed to upload file to storage:', uploadError);
            throw new Error(`Failed to upload file: ${uploadError.message}`);
        }

        // Always use signed URL for reliable access (works for both public and private buckets)
        let signedUrl: string | null = null;
        if (uploadData) {
            const { data: urlData, error: urlError } = await supabase.storage
                .from('files')
                .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days expiry
            
            if (!urlError && urlData) {
                signedUrl = urlData.signedUrl;
            }
        }

        // Create metadata in database (store storage_path, NOT the signed URL since it expires)
        const payload: any = {
            name: file.name,
            size: file.size,
            mime_type: file.type,
            folder_id: parentId,
            type: 'file',
            user_id: user.id,
            storage_path: filePath,
            // Don't store signed URL in DB as it expires
            public_url: null
        };

        const { data, error } = await supabase.from('files').insert(payload).select().single();
        if (error) {
            // If database insert fails and we uploaded to storage, try to clean up
            await supabase.storage.from('files').remove([filePath]);
            console.error('Failed to create file metadata:', error);
            throw error;
        }

        return {
            id: data.id,
            name: data.name,
            folderId: data.folder_id,
            type: 'file',
            size: data.size,
            mimeType: data.mime_type,
            uploadDate: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
            storagePath: data.storage_path,
            // Return the freshly created signed URL for immediate use
            publicUrl: signedUrl || undefined
        };
    }

    async getFileUrl(fileId: string): Promise<string | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('You must be logged in to access files');
        }

        const { data, error } = await supabase
            .from('files')
            .select('storage_path')
            .eq('id', fileId)
            .eq('user_id', user.id)
            .single();

        if (error || !data) {
            console.warn('File metadata not found for id:', fileId, error);
            return null;
        }

        // Always generate fresh signed URL for reliable access
        if (data.storage_path) {
            const { data: urlData, error: urlError } = await supabase.storage
                .from('files')
                .createSignedUrl(data.storage_path, 60 * 60); // 1 hour expiry

            if (urlError) {
                console.error('Failed to create signed URL:', urlError);
                return null;
            }

            return urlData?.signedUrl || null;
        }

        console.warn('No storage path for file:', fileId);
        return null;
    }

    async deleteFileItem(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('You must be logged in to delete files');
        }

        const { error } = await supabase
            .from('files')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) {
            console.error('Failed to delete file:', error);
            throw error;
        }
    }

    // --- Media ---

    async getMedia(): Promise<MediaItem[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.warn('No authenticated user, returning empty media');
            return [];
        }

        const { data, error } = await supabase
            .from('media')
            .select('*')
            .eq('user_id', user.id);
        if (error) {
            console.warn("Could not fetch media", error);
            return [];
        }
        return (data || []).map((row: any) => ({
            id: row.id,
            title: row.title || '',
            type: row.type,
            status: row.status,
            rating: row.rating || 0,
            year: row.year,
            image: row.image
        }));
    }

    async saveMedia(item: MediaItem): Promise<MediaItem> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('You must be logged in to save media');
        }

        const payload: any = {
            title: item.title,
            type: item.type,
            status: item.status,
            rating: item.rating || 0,
            year: item.year,
            image: item.image,
            user_id: user.id
        };

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
        let result;

        if (isUuid) {
            const { data, error } = await supabase
                .from('media')
                .update(payload)
                .eq('id', item.id)
                .eq('user_id', user.id)
                .select()
                .single();
            if (error) {
                console.error('Failed to update media:', error);
                throw error;
            }
            if (!data) {
                throw new Error('Media item not found or access denied');
            }
            result = data;
        } else {
            const { data, error } = await supabase
                .from('media')
                .insert(payload)
                .select()
                .single();
            if (error) {
                console.error('Failed to create media:', error);
                throw error;
            }
            result = data;
        }

        return { ...item, id: result.id };
    }

    async deleteMedia(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('You must be logged in to delete media');
        }

        const { error } = await supabase
            .from('media')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) {
            console.error('Failed to delete media:', error);
            throw error;
        }
    }
}

export const api = new ApiService();
