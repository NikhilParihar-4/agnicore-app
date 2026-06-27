// src/lib/supabase.js
// Replace VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with your actual values from Supabase dashboard
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
