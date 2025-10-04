import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdrmgzoupwyisiyrnjdi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcm1nem91cHd5aXNpeXJuamRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzAwMTYsImV4cCI6MjA3NTEwNjAxNn0.vUyruswv1NGm-pDn9a9aTn28Z_BVPUfZmtPk7wcQtTg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client με service role key για διαχείριση
const supabaseAdminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcm1nem91cHd5aXNpeXJuamRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUzMDAxNiwiZXhwIjoyMDc1MTA2MDE2fQ.uH3E-xqFmKkMF6Uul3jaSHTqloqklWDg7KaIAMxq_CQ';

export const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey);
