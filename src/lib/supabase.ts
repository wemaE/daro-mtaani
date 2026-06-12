import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || 
                     (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
                     'https://placeholder-url.supabase.co';

const supabaseAnonKey = (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || 
                        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 
                        'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
