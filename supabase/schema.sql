-- Run this in your Supabase SQL editor before using the app.

-- ---------------------------------------------------------------------------
-- Documents
-- ---------------------------------------------------------------------------

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Untitled Document',
  kind text not null default 'pdf' check (kind in ('pdf', 'budget')),
  storage_path text not null,
  share_pin text not null default '----',
  budget_data jsonb,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Migrate existing installs
alter table documents add column if not exists name text not null default 'Untitled Document';
alter table documents add column if not exists kind text not null default 'pdf';
alter table documents add column if not exists budget_data jsonb;
alter table documents add column if not exists owner_id uuid references auth.users(id) on delete set null;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Private bucket: PDFs are only accessible via service-role signed URLs
-- after PIN validation in the viewPdf server function.
-- No public read policy is intentionally defined.

alter table documents enable row level security;

drop policy if exists "Users can view own documents" on documents;
create policy "Users can view own documents"
  on documents for select
  using (auth.uid() = owner_id);

drop policy if exists "Users can insert own documents" on documents;
create policy "Users can insert own documents"
  on documents for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update own documents" on documents;
create policy "Users can update own documents"
  on documents for update
  using (auth.uid() = owner_id);

drop policy if exists "Users can delete own documents" on documents;
create policy "Users can delete own documents"
  on documents for delete
  using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- User profiles (extends auth.users)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  email text not null,
  full_name text,
  avatar_url text,
  auth_provider text not null default 'email' check (auth_provider in ('email', 'google')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) >= 3),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]+$')
);

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email));

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_profiles_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  provider text;
  username_value text;
  full_name_value text;
begin
  provider := coalesce(new.raw_app_meta_data->>'provider', 'email');

  username_value := lower(trim(coalesce(new.raw_user_meta_data->>'username', '')));

  if username_value = '' then
    username_value := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '_', 'g'));
  end if;

  username_value := regexp_replace(username_value, '[^a-z0-9_]', '_', 'g');

  if char_length(username_value) < 3 then
    username_value := username_value || '_' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;

  full_name_value := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    username_value
  );

  insert into public.profiles (
    id,
    username,
    email,
    full_name,
    avatar_url,
    auth_provider
  )
  values (
    new.id,
    username_value,
    lower(new.email),
    full_name_value,
    new.raw_user_meta_data->>'avatar_url',
    case when provider = 'google' then 'google' else 'email' end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    auth_provider = excluded.auth_provider,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles
  for update
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Enable email auth in Supabase dashboard:
-- Authentication → Providers → Email (enabled)
-- Authentication → Providers → Google (enabled)
-- Redirect URL: http://localhost:3000/auth/callback
-- ---------------------------------------------------------------------------
