-- Run this in your Supabase SQL editor before using the PDF module.

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Untitled Document',
  kind text not null default 'pdf' check (kind in ('pdf', 'budget')),
  storage_path text not null,
  share_pin text not null default '----',
  budget_data jsonb,
  created_at timestamptz default now()
);

-- Migrate existing installs
alter table documents add column if not exists name text not null default 'Untitled Document';
alter table documents add column if not exists kind text not null default 'pdf';
alter table documents add column if not exists budget_data jsonb;

-- TODO Phase 2: attach owner_id to document record
-- alter table documents add column owner_id uuid references auth.users(id);

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
