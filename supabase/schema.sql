-- Run this in your Supabase SQL editor before using the PDF module.

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  share_pin text not null,
  created_at timestamptz default now()
);

-- TODO Phase 2: attach owner_id to document record
-- alter table documents add column owner_id uuid references auth.users(id);

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
