-- ============================================
-- Πλήρες SQL Setup για Session Deposits
-- Τρέξε αυτό στο Supabase SQL Editor
-- ============================================

-- 1) Extensions (ασφαλή - αν υπάρχουν ήδη δεν κάνουν τίποτα)
create extension if not exists citext;
create extension if not exists pgcrypto;

-- 2) Πίνακες deposits
create table if not exists public.session_deposits (
  id uuid primary key default gen_random_uuid(),
  customer_email citext not null,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  remaining_sessions integer not null check (remaining_sessions >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint session_deposits_unique unique (customer_email, doctor_id)
);

create table if not exists public.session_deposit_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_email citext not null,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  delta_sessions integer not null,
  reason text not null check (reason in ('purchase','redeem','adjustment')),
  payment_id uuid null references public.payments(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes για γρήγορη αναζήτηση
create index if not exists idx_session_deposits_email on public.session_deposits(customer_email);
create index if not exists idx_session_deposits_doctor on public.session_deposits(doctor_id);
create index if not exists idx_session_deposit_tx_email on public.session_deposit_transactions(customer_email);
create index if not exists idx_session_deposit_tx_doctor on public.session_deposit_transactions(doctor_id);

-- 3) Function για auto-update του updated_at
create or replace function public.set_updated_at_timestamp()
returns trigger 
language plpgsql 
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Trigger για updated_at
drop trigger if exists trg_session_deposits_updated_at on public.session_deposits;
create trigger trg_session_deposits_updated_at
before update on public.session_deposits
for each row execute function public.set_updated_at_timestamp();

-- 4) Function για εφαρμογή συναλλαγής (ΔΙΟΡΘΩΜΕΝΟ SYNTAX)
create or replace function public.apply_deposit_transaction()
returns trigger 
language plpgsql 
security definer 
set search_path=public 
as $$
declare
  v_existing public.session_deposits%rowtype;
begin
  -- Βρες υπάρχον deposit (ή null αν δεν υπάρχει)
  select * into v_existing 
  from public.session_deposits
  where customer_email = new.customer_email 
    and doctor_id = new.doctor_id
  for update;

  if not found then
    -- Πρώτη φορά: δημιούργησε deposit (με το max(0, delta) για safety)
    insert into public.session_deposits (customer_email, doctor_id, remaining_sessions)
    values (new.customer_email, new.doctor_id, greatest(new.delta_sessions, 0));
  else
    -- Έλεγχος: το υπόλοιπο δεν πρέπει να γίνει αρνητικό
    if (v_existing.remaining_sessions + new.delta_sessions) < 0 then
      raise exception 'Insufficient deposit sessions for % (doctor_id=%). Current: %, requested delta: %',
        new.customer_email, new.doctor_id, v_existing.remaining_sessions, new.delta_sessions
        using errcode = '22003';
    end if;

    -- Ενημέρωση υπολοίπου
    update public.session_deposits
    set remaining_sessions = v_existing.remaining_sessions + new.delta_sessions,
        updated_at = now()
    where id = v_existing.id;
  end if;

  return new;
end;
$$;

-- Trigger που καλεί την function μετά από κάθε INSERT στο transactions
drop trigger if exists trg_apply_deposit_tx on public.session_deposit_transactions;
create trigger trg_apply_deposit_tx
after insert on public.session_deposit_transactions
for each row execute function public.apply_deposit_transaction();

-- 5) Row Level Security (RLS)
alter table public.session_deposits enable row level security;
alter table public.session_deposit_transactions enable row level security;

-- Policy: Χρήστες βλέπουν ΜΟΝΟ τα δικά τους deposits
drop policy if exists select_own_deposits on public.session_deposits;
create policy select_own_deposits
on public.session_deposits
for select
to authenticated
using (customer_email = (auth.jwt() ->> 'email')::citext);

-- Policy: Χρήστες βλέπουν ΜΟΝΟ τα δικά τους transactions
drop policy if exists select_own_deposit_txs on public.session_deposit_transactions;
create policy select_own_deposit_txs
on public.session_deposit_transactions
for select
to authenticated
using (customer_email = (auth.jwt() ->> 'email')::citext);

-- Policy: Απαγόρευση user-side mutations (writes γίνονται μόνο από service role/webhook)
drop policy if exists block_mutations_deposits on public.session_deposits;
create policy block_mutations_deposits
on public.session_deposits
for all
to authenticated
using (false)
with check (false);

drop policy if exists block_mutations_deposit_txs on public.session_deposit_transactions;
create policy block_mutations_deposit_txs
on public.session_deposit_transactions
for all
to authenticated
using (false)
with check (false);

-- 6) Προαιρετικό View για εύκολα joins στο UI
create or replace view public.v_user_deposits as
select 
  sd.customer_email,
  sd.doctor_id,
  d.name as doctor_name,
  sd.remaining_sessions,
  sd.updated_at
from public.session_deposits sd
join public.doctors d on d.id = sd.doctor_id;

-- 7) Grant permissions (για να μπορούν να διαβάσουν το view)
grant select on public.v_user_deposits to authenticated;

