-- Per-user Google Drive OAuth connections (refresh tokens; service-role access only).

create table if not exists public.user_google_drive_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  refresh_token text not null,
  google_email text,
  app_folder_id text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_user_google_drive_connections_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_google_drive_connections_set_updated_at
  on public.user_google_drive_connections;

create trigger user_google_drive_connections_set_updated_at
  before update on public.user_google_drive_connections
  for each row execute function public.set_user_google_drive_connections_updated_at();

alter table public.user_google_drive_connections enable row level security;
