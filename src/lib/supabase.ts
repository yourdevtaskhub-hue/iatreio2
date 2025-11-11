import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdrmgzoupwyisiyrnjdi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcm1nem91cHd5aXNpeXJuamRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzAwMTYsImV4cCI6MjA3NTEwNjAxNn0.vUyruswv1NGm-pDn9a9aTn28Z_BVPUfZmtPk7wcQtTg';
const supabaseAdminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcm1nem91cHd5aXNpeXJuamRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUzMDAxNiwiZXhwIjoyMDc1MTA2MDE2fQ.uH3E-xqFmKkMF6Uul3jaSHTqloqklWDg7KaIAMxq_CQ';

// Create singleton instances to avoid multiple GoTrueClient instances
let supabaseInstance: any = null;
let supabaseAdminInstance: any = null;

const getSupabase = () => {
  if (!supabaseInstance) {
    console.log('🔍 [DEBUG] Creating new Supabase client instance');
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    });
  }
  return supabaseInstance;
};

const getSupabaseAdmin = () => {
  if (!supabaseAdminInstance) {
    console.log('🔍 [DEBUG] Creating new Supabase Admin client instance');
    supabaseAdminInstance = createClient(supabaseUrl, supabaseAdminKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'supabase-admin-service-role'
      }
    });
  }
  return supabaseAdminInstance;
};

// Export lazy getters to ensure singleton pattern is maintained across all imports
// This prevents multiple GoTrueClient instances
export const supabase = getSupabase();
export const supabaseAdmin = getSupabaseAdmin();

// Ensure we don't create multiple instances if module is re-imported
if (typeof window !== 'undefined') {
  (window as any).__supabase_singleton = supabase;
  (window as any).__supabaseAdmin_singleton = supabaseAdmin;
}
