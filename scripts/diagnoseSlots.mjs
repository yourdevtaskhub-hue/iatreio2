// Διαγνωστικό script για slots
// Χρήση: node scripts/diagnoseSlots.mjs 2025-10-08 <doctor_id>

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdrmgzoupwyisiyrnjdi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcm1nem91cHd5aXNpeXJuamRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzAwMTYsImV4cCI6MjA3NTEwNjAxNn0.vUyruswv1NGm-pDn9a9aTn28Z_BVPUfZmtPk7wcQtTg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const [dateArg, doctorId] = process.argv.slice(2);
if (!dateArg || !doctorId) {
  console.error('Παράδειγμα: node scripts/diagnoseSlots.mjs 2025-10-08 <doctor_id>');
  process.exit(1);
}

function toMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function pad(n) { return String(n).padStart(2, '0'); }

function minutesToHHMM(m) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${pad(h)}:${pad(mm)}`;
}

async function main() {
  console.log('=== Διαγνωστικά Slots ===');
  console.log('Ημερομηνία:', dateArg, 'Γιατρός:', doctorId);

  const { data: availability, error: avErr } = await supabase
    .from('availability')
    .select('date,start_time,end_time,increment_minutes')
    .eq('doctor_id', doctorId)
    .eq('date', dateArg)
    .order('start_time');
  if (avErr) { console.error('Σφάλμα availability:', avErr); process.exit(1); }
  console.log('\n[availability]', availability);

  const { data: appointments, error: apErr } = await supabase
    .from('appointments')
    .select('time')
    .eq('doctor_id', doctorId)
    .eq('date', dateArg)
    .order('time');
  if (apErr) { console.error('Σφάλμα appointments:', apErr); process.exit(1); }
  console.log('\n[appointments]', appointments);

  const bookedSet = new Set((appointments || []).map(a => a.time));
  const slots = new Map();

  for (const a of availability || []) {
    if (!a || !a.start_time || !a.end_time || !a.increment_minutes) continue;
    const inc = Number(a.increment_minutes);
    if (inc !== 30 && inc !== 60) continue;
    const start = toMinutes(a.start_time);
    const end = toMinutes(a.end_time);
    for (let cur = start; cur < end; cur += inc) {
      const t = minutesToHHMM(cur);
      const available = !bookedSet.has(t);
      const prev = slots.get(t);
      slots.set(t, { time: t, available: prev ? prev.available || available : available });
    }
  }

  const list = Array.from(slots.values()).sort((a,b)=> a.time.localeCompare(b.time));
  console.log('\n[computed_slots]', list);
}

main().catch(e => { console.error(e); process.exit(1); });


