import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://zozafyzizxucajknupwz.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvemFmeXppenh1Y2Fqa251cHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTI4MTAsImV4cCI6MjEwNTI4ODgxMH0.euLEYz0megro7RW8AdZqB0GLraC0U3ccERsIwR8b-64';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
