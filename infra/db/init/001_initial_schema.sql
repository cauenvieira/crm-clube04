create table if not exists sync_state (
  id text primary key,
  last_run_at timestamptz,
  cursor_value text,
  content_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists imported_records (
  id bigserial primary key,
  source_system text not null,
  source_entity text not null,
  source_id text not null,
  content_hash text not null,
  payload jsonb not null,
  imported_at timestamptz not null default now(),
  unique (source_system, source_entity, source_id)
);

create table if not exists team_notes (
  id bigserial primary key,
  subject_type text not null,
  subject_id text not null,
  note text not null,
  created_at timestamptz not null default now()
);
