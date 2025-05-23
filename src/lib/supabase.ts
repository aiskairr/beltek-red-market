import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://thggdvdkvsrytiwqhsbe.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZ2dkdmRrdnNyeXRpd3Foc2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTIyMjIsImV4cCI6MjA2MzQ4ODIyMn0.a_-qrjwuFCv8hk0IOSGqAYHznwTlG_e3guNzUFMun3E"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Отсутствуют переменные окружения Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
