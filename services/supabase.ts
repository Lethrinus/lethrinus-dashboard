
import { createClient } from '@supabase/supabase-js';

// These variables must be defined in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is missing! Check your .env file.");
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
