-- Bank statement AI extraction (Phase 1 local accounting store)

create table if not exists public.bank_statements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  status text not null default 'saved' check (status in ('draft', 'saved')),
  bank_name text,
  account_name text,
  account_number text,
  currency text,
  period_start date,
  period_end date,
  opening_balance numeric(14, 2),
  closing_balance numeric(14, 2),
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bank_statements_owner_id_idx
  on public.bank_statements (owner_id);

create index if not exists bank_statements_owner_created_idx
  on public.bank_statements (owner_id, created_at desc);

create table if not exists public.bank_transactions (
  id uuid primary key default gen_random_uuid(),
  statement_id uuid not null references public.bank_statements(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  txn_date date not null,
  description text not null default '',
  amount numeric(14, 2) not null,
  direction text not null default 'unknown'
    check (direction in ('debit', 'credit', 'unknown')),
  balance numeric(14, 2),
  category text,
  reference text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bank_transactions_statement_id_idx
  on public.bank_transactions (statement_id);

create index if not exists bank_transactions_owner_id_idx
  on public.bank_transactions (owner_id);

create or replace function public.set_bank_statements_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bank_statements_set_updated_at on public.bank_statements;
create trigger bank_statements_set_updated_at
  before update on public.bank_statements
  for each row execute function public.set_bank_statements_updated_at();

create or replace function public.set_bank_transactions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bank_transactions_set_updated_at on public.bank_transactions;
create trigger bank_transactions_set_updated_at
  before update on public.bank_transactions
  for each row execute function public.set_bank_transactions_updated_at();

alter table public.bank_statements enable row level security;
alter table public.bank_transactions enable row level security;

drop policy if exists "Users can view own bank statements" on public.bank_statements;
create policy "Users can view own bank statements"
  on public.bank_statements for select
  using (auth.uid() = owner_id);

drop policy if exists "Users can insert own bank statements" on public.bank_statements;
create policy "Users can insert own bank statements"
  on public.bank_statements for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update own bank statements" on public.bank_statements;
create policy "Users can update own bank statements"
  on public.bank_statements for update
  using (auth.uid() = owner_id);

drop policy if exists "Users can delete own bank statements" on public.bank_statements;
create policy "Users can delete own bank statements"
  on public.bank_statements for delete
  using (auth.uid() = owner_id);

drop policy if exists "Users can view own bank transactions" on public.bank_transactions;
create policy "Users can view own bank transactions"
  on public.bank_transactions for select
  using (auth.uid() = owner_id);

drop policy if exists "Users can insert own bank transactions" on public.bank_transactions;
create policy "Users can insert own bank transactions"
  on public.bank_transactions for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update own bank transactions" on public.bank_transactions;
create policy "Users can update own bank transactions"
  on public.bank_transactions for update
  using (auth.uid() = owner_id);

drop policy if exists "Users can delete own bank transactions" on public.bank_transactions;
create policy "Users can delete own bank transactions"
  on public.bank_transactions for delete
  using (auth.uid() = owner_id);
