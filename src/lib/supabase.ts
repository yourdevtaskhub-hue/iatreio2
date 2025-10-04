// Fallback για το build αν δεν είναι διαθέσιμο το @supabase/supabase-js
let createClient: any;
let supabase: any;
let supabaseAdmin: any;

try {
  const supabaseModule = require('@supabase/supabase-js');
  createClient = supabaseModule.createClient;
  
  const supabaseUrl = 'https://vdrmgzoupwyisiyrnjdi.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcm1nem91cHd5aXNpeXJuamRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzAwMTYsImV4cCI6MjA3NTEwNjAxNn0.vUyruswv1NGm-pDn9a9aTn28Z_BVPUfZmtPk7wcQtTg';
  const supabaseAdminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcm1nem91cHd5aXNpeXJuamRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUzMDAxNiwiZXhwIjoyMDc1MTA2MDE2fQ.uH3E-xqFmKkMF6Uul3jaSHTqloqklWDg7KaIAMxq_CQ';

  supabase = createClient(supabaseUrl, supabaseAnonKey);
  supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey);
} catch (error) {
  // Fallback mock objects για το build
  console.warn('Supabase not available, using mock objects');
  
  const mockClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null })
        })
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    })
  };
  
  supabase = mockClient;
  supabaseAdmin = mockClient;
}

export { supabase, supabaseAdmin };
