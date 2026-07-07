-- Payees for AI-assisted client / vendor management

create table if not exists public.payees (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  abn text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payees_owner_id_idx on public.payees (owner_id);
create index if not exists payees_owner_name_lower_idx on public.payees (owner_id, lower(name));

create or replace function public.set_payees_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payees_set_updated_at on public.payees;
create trigger payees_set_updated_at
  before update on public.payees
  for each row execute function public.set_payees_updated_at();

alter table public.payees enable row level security;

drop policy if exists "Users can view own payees" on public.payees;
create policy "Users can view own payees"
  on public.payees for select
  using (auth.uid() = owner_id);

drop policy if exists "Users can insert own payees" on public.payees;
create policy "Users can insert own payees"
  on public.payees for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update own payees" on public.payees;
create policy "Users can update own payees"
  on public.payees for update
  using (auth.uid() = owner_id);

drop policy if exists "Users can delete own payees" on public.payees;
create policy "Users can delete own payees"
  on public.payees for delete
  using (auth.uid() = owner_id);
