-- Add Google Drive metadata columns for signed PDFs
alter table documents add column if not exists drive_file_id text;
alter table documents add column if not exists drive_url text;
