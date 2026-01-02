/**
 * Cloudflare R2 Storage Worker
 * 
 * This worker handles file uploads, downloads, and management for R2 storage.
 * Deploy this to Cloudflare Workers and bind your R2 bucket.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Cloudflare Workers project: `npx wrangler init r2-storage-worker`
 * 2. Copy this file as `src/index.js`
 * 3. Update `wrangler.toml` with the configuration below
 * 4. Deploy: `npx wrangler deploy`
 * 
 * wrangler.toml configuration:
 * ```
 * name = "r2-storage-worker"
 * main = "src/index.js"
 * compatibility_date = "2024-01-01"
 * 
 * [[r2_buckets]]
 * binding = "R2_BUCKET"
 * bucket_name = "your-bucket-name"
 * 
 * [vars]
 * ALLOWED_ORIGINS = "https://your-app-domain.com,http://localhost:5173"
 * AUTH_SECRET = "your-secret-key-for-auth"
 * ```
 */

export default {
    async fetch(request, env, ctx) {
        // CORS handling
        const corsHeaders = {
            'Access-Control-Allow-Origin': getAllowedOrigin(request, env),
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
        };

        // Handle preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // Route handling
            if (path === '/upload' && request.method === 'POST') {
                return await handleUpload(request, env, corsHeaders);
            }
            
            if (path === '/delete' && request.method === 'DELETE') {
                return await handleDelete(request, env, corsHeaders);
            }
            
            if (path === '/signed-url' && request.method === 'GET') {
                return await handleSignedUrl(request, env, corsHeaders);
            }
            
            if (path === '/list' && request.method === 'GET') {
                return await handleList(request, env, corsHeaders);
            }
            
            if (path.startsWith('/file/') && request.method === 'GET') {
                return await handleGetFile(request, env, corsHeaders);
            }

            return jsonResponse({ error: 'Not found' }, 404, corsHeaders);
        } catch (error) {
            console.error('Worker error:', error);
            return jsonResponse({ error: error.message || 'Internal error' }, 500, corsHeaders);
        }
    }
};

// Helper: Get allowed origin for CORS
function getAllowedOrigin(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return origin;
    }
    
    // Default to first allowed origin or wildcard for development
    return allowedOrigins[0] || '*';
}

// Helper: JSON response
function jsonResponse(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
}

// Helper: Verify auth (optional - implement as needed)
function verifyAuth(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return true; // No auth required if no secret set
    
    if (!env.AUTH_SECRET) return true;
    
    const token = authHeader.replace('Bearer ', '');
    return token === env.AUTH_SECRET;
}

// Upload handler
async function handleUpload(request, env, corsHeaders) {
    if (!verifyAuth(request, env)) {
        return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const customPath = formData.get('path');

    if (!file) {
        return jsonResponse({ error: 'No file provided' }, 400, corsHeaders);
    }

    // Generate unique key
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop() || '';
    const key = customPath || `uploads/${timestamp}_${random}.${extension}`;

    // Upload to R2
    await env.R2_BUCKET.put(key, file.stream(), {
        httpMetadata: {
            contentType: file.type,
        },
        customMetadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
        },
    });

    // Return the URL
    const url = new URL(request.url);
    const publicUrl = `${url.origin}/file/${encodeURIComponent(key)}`;

    return jsonResponse({
        success: true,
        key,
        url: publicUrl,
        size: file.size,
        type: file.type,
    }, 200, corsHeaders);
}

// Get file handler
async function handleGetFile(request, env, corsHeaders) {
    const url = new URL(request.url);
    const key = decodeURIComponent(url.pathname.replace('/file/', ''));

    const object = await env.R2_BUCKET.get(key);

    if (!object) {
        return jsonResponse({ error: 'File not found' }, 404, corsHeaders);
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000');
    headers.set('ETag', object.httpEtag);
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
    });

    return new Response(object.body, { headers });
}

// Signed URL handler
async function handleSignedUrl(request, env, corsHeaders) {
    if (!verifyAuth(request, env)) {
        return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
    }

    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
        return jsonResponse({ error: 'Key is required' }, 400, corsHeaders);
    }

    // Check if object exists
    const object = await env.R2_BUCKET.head(key);
    if (!object) {
        return jsonResponse({ error: 'File not found' }, 404, corsHeaders);
    }

    // Return the public URL (since we're serving through the worker)
    const publicUrl = `${url.origin}/file/${encodeURIComponent(key)}`;

    return jsonResponse({
        url: publicUrl,
        expires: null, // Our worker URLs don't expire
    }, 200, corsHeaders);
}

// Delete handler
async function handleDelete(request, env, corsHeaders) {
    if (!verifyAuth(request, env)) {
        return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
    }

    const body = await request.json();
    const key = body.key;

    if (!key) {
        return jsonResponse({ error: 'Key is required' }, 400, corsHeaders);
    }

    await env.R2_BUCKET.delete(key);

    return jsonResponse({ success: true }, 200, corsHeaders);
}

// List handler
async function handleList(request, env, corsHeaders) {
    if (!verifyAuth(request, env)) {
        return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
    }

    const url = new URL(request.url);
    const prefix = url.searchParams.get('prefix') || '';
    const limit = parseInt(url.searchParams.get('limit') || '1000');

    const listed = await env.R2_BUCKET.list({
        prefix,
        limit,
    });

    const objects = listed.objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded.toISOString(),
        etag: obj.etag,
    }));

    return jsonResponse({
        success: true,
        objects,
        truncated: listed.truncated,
        cursor: listed.cursor,
    }, 200, corsHeaders);
}

