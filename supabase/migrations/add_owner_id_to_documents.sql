-- Run this in Supabase Dashboard → SQL Editor if save/generate fails with:
-- "Could not find the 'owner_id' column of 'documents' in the schema cache"

-- 1. Add owner_id column (safe to re-run)
alter table public.documents
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

-- 2. Optional: assign orphaned rows to your user (replace YOUR_USER_UUID)
-- update public.documents set owner_id = 'YOUR_USER_UUID' where owner_id is null;

-- 3. Row-level security (per-user documents)
alter table public.documents enable row level security;

drop policy if exists "Users can view own documents" on public.documents;
create policy "Users can view own documents"
  on public.documents for select
  using (auth.uid() = owner_id);

drop policy if exists "Users can insert own documents" on public.documents;
create policy "Users can insert own documents"
  on public.documents for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update own documents" on public.documents;
create policy "Users can update own documents"
  on public.documents for update
  using (auth.uid() = owner_id);

drop policy if exists "Users can delete own documents" on public.documents;
create policy "Users can delete own documents"
  on public.documents for delete
  using (auth.uid() = owner_id);

-- 4. Refresh PostgREST schema cache (Supabase usually picks this up within seconds)
