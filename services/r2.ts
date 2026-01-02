// Cloudflare R2 Storage Service
// This service handles file uploads and retrievals from Cloudflare R2

// R2 Worker URL - Set this in your .env file
const R2_WORKER_URL = import.meta.env.VITE_R2_WORKER_URL || '';

interface R2UploadResponse {
    success: boolean;
    key: string;
    url: string;
    error?: string;
}

interface R2DeleteResponse {
    success: boolean;
    error?: string;
}

interface R2ListResponse {
    success: boolean;
    objects: Array<{
        key: string;
        size: number;
        uploaded: string;
    }>;
    error?: string;
}

class R2Service {
    private workerUrl: string;

    constructor() {
        this.workerUrl = R2_WORKER_URL;
    }

    isConfigured(): boolean {
        return !!this.workerUrl;
    }

    /**
     * Upload a file to R2 storage
     */
    async uploadFile(file: File, path: string, authToken?: string): Promise<R2UploadResponse> {
        if (!this.isConfigured()) {
            throw new Error('R2 is not configured. Set VITE_R2_WORKER_URL in your .env file.');
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('path', path);

            const headers: HeadersInit = {};
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${this.workerUrl}/upload`, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
                throw new Error(errorData.error || `Upload failed with status ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                key: data.key,
                url: data.url,
            };
        } catch (error: any) {
            console.error('R2 upload error:', error);
            return {
                success: false,
                key: '',
                url: '',
                error: error.message || 'Failed to upload file',
            };
        }
    }

    /**
     * Get a signed URL for a file
     */
    async getSignedUrl(key: string, authToken?: string): Promise<string | null> {
        if (!this.isConfigured()) {
            console.warn('R2 is not configured');
            return null;
        }

        try {
            const headers: HeadersInit = {};
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${this.workerUrl}/signed-url?key=${encodeURIComponent(key)}`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                console.error('Failed to get signed URL:', response.status);
                return null;
            }

            const data = await response.json();
            return data.url || null;
        } catch (error) {
            console.error('R2 signed URL error:', error);
            return null;
        }
    }

    /**
     * Get the public URL for a file (if bucket is public)
     */
    getPublicUrl(key: string): string {
        if (!this.isConfigured()) {
            return '';
        }
        return `${this.workerUrl}/file/${encodeURIComponent(key)}`;
    }

    /**
     * Delete a file from R2 storage
     */
    async deleteFile(key: string, authToken?: string): Promise<R2DeleteResponse> {
        if (!this.isConfigured()) {
            throw new Error('R2 is not configured');
        }

        try {
            const headers: HeadersInit = {};
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${this.workerUrl}/delete`, {
                method: 'DELETE',
                headers,
                body: JSON.stringify({ key }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Delete failed' }));
                throw new Error(errorData.error || `Delete failed with status ${response.status}`);
            }

            return { success: true };
        } catch (error: any) {
            console.error('R2 delete error:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete file',
            };
        }
    }

    /**
     * List files in R2 storage (optional prefix filter)
     */
    async listFiles(prefix?: string, authToken?: string): Promise<R2ListResponse> {
        if (!this.isConfigured()) {
            throw new Error('R2 is not configured');
        }

        try {
            const headers: HeadersInit = {};
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const url = prefix 
                ? `${this.workerUrl}/list?prefix=${encodeURIComponent(prefix)}`
                : `${this.workerUrl}/list`;

            const response = await fetch(url, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'List failed' }));
                throw new Error(errorData.error || `List failed with status ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                objects: data.objects || [],
            };
        } catch (error: any) {
            console.error('R2 list error:', error);
            return {
                success: false,
                objects: [],
                error: error.message || 'Failed to list files',
            };
        }
    }
}

export const r2 = new R2Service();

