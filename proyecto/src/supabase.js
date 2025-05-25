// src/supabase.js 
import { createClient } from '@supabase/supabase-js'; 
    const supabaseUrl = 'https://twncppbvrpqdhpjspdwi.supabase.co'; 
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3bmNwcGJ2cnBxZGhwanNwZHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjg5MTgsImV4cCI6MjA2MzcwNDkxOH0.5amg2HfJI2GuBbKyRO_dWoTc2ztJpOn8wdZ4kPOyBjs'; 
export const supabase = createClient(supabaseUrl, supabaseKey);