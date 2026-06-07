import { createClient } from '@supabase/supabase-js';

// Grab our secret environment keys safely from Vite's context
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail early if keys are missing so we don't wonder why the app is broken
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your local .env file.');
}

// Create a single, reusable instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);