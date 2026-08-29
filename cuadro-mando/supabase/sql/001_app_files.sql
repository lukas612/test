create table if not exists app_files (
  name text primary key,
  content text,
  updated_at timestamptz default now()
);
