create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'contact_type') then
    create type contact_type as enum ('lead', 'cliente', 'lead_e_cliente', 'outro');
  end if;

  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type lead_status as enum (
      'novo_lead',
      'em_atendimento',
      'aguardando_resposta',
      'em_negociacao',
      'agendado',
      'compareceu',
      'nao_compareceu',
      'perdido',
      'desqualificado',
      'reativar_depois'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'message_direction') then
    create type message_direction as enum ('inbound', 'outbound', 'system');
  end if;

  if not exists (select 1 from pg_type where typname = 'package_status') then
    create type package_status as enum (
      'ativo',
      'perto_de_acabar',
      'finalizado',
      'nao_renovou',
      'parado',
      'cancelado',
      'desconhecido'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'action_item_status') then
    create type action_item_status as enum (
      'pendente',
      'em_andamento',
      'concluido',
      'ignorado',
      'reagendado'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'sync_status') then
    create type sync_status as enum ('idle', 'running', 'success', 'error');
  end if;

  if not exists (select 1 from pg_type where typname = 'processing_status') then
    create type processing_status as enum ('pending', 'processed', 'skipped', 'error');
  end if;
end $$;

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  normalized_phone text,
  email text,
  source text,
  external_customer_id text,
  type contact_type not null default 'lead',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists contacts_normalized_phone_uidx
  on contacts (normalized_phone)
  where normalized_phone is not null;

create index if not exists contacts_external_customer_id_idx on contacts (external_customer_id);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts (id) on delete cascade,
  pet_name text,
  pet_breed text,
  pet_size text,
  service_interest text,
  source text,
  campaign text,
  status lead_status not null default 'novo_lead',
  assigned_to text,
  first_message_at timestamptz,
  last_interaction_at timestamptz,
  next_action_at timestamptz,
  attempts_count integer not null default 0 check (attempts_count >= 0),
  qualified boolean not null default false,
  macro_reason text,
  micro_reason text,
  loss_reason text,
  final_conclusion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_contact_id_idx on leads (contact_id);
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_next_action_at_idx on leads (next_action_at);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts (id) on delete cascade,
  channel text not null,
  provider text not null,
  provider_conversation_id text,
  status text not null default 'open',
  started_at timestamptz,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_conversation_id)
);

create index if not exists conversations_contact_id_idx on conversations (contact_id);
create index if not exists conversations_last_message_at_idx on conversations (last_message_at);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  contact_id uuid not null references contacts (id) on delete cascade,
  provider text not null,
  provider_message_id text,
  direction message_direction not null,
  message_type text not null default 'text',
  from_number text,
  to_number text,
  body text,
  media_url text,
  "timestamp" timestamptz not null,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists messages_provider_message_uidx
  on messages (provider, provider_message_id)
  where provider_message_id is not null;

create index if not exists messages_conversation_id_idx on messages (conversation_id);
create index if not exists messages_contact_id_idx on messages (contact_id);
create index if not exists messages_provider_message_id_idx on messages (provider_message_id);
create index if not exists messages_timestamp_idx on messages ("timestamp");

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts (id) on delete set null,
  external_customer_id text,
  name text not null,
  phone text,
  normalized_phone text,
  email text,
  city text,
  neighborhood text,
  source_system text not null default 'clube04',
  raw_data jsonb,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, external_customer_id)
);

create index if not exists customers_contact_id_idx on customers (contact_id);
create index if not exists customers_normalized_phone_idx on customers (normalized_phone);
create index if not exists customers_external_customer_id_idx on customers (external_customer_id);

create table if not exists pets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  contact_id uuid references contacts (id) on delete set null,
  external_pet_id text,
  name text not null,
  breed text,
  size text,
  weight numeric(8, 2),
  coat_type text,
  notes text,
  registered_frequency_days integer check (registered_frequency_days > 0),
  registered_frequency_source text,
  registered_frequency_notes text,
  source_system text not null default 'clube04',
  raw_data jsonb,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, external_pet_id)
);

create index if not exists pets_customer_id_idx on pets (customer_id);
create index if not exists pets_contact_id_idx on pets (contact_id);
create index if not exists pets_external_pet_id_idx on pets (external_pet_id);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  external_appointment_id text,
  customer_id uuid references customers (id) on delete set null,
  pet_id uuid references pets (id) on delete set null,
  contact_id uuid references contacts (id) on delete set null,
  scheduled_at timestamptz not null,
  service_name text,
  employee_name text,
  status text,
  notes text,
  source_system text not null default 'clube04',
  raw_data jsonb,
  content_hash text,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, external_appointment_id)
);

create index if not exists appointments_customer_id_idx on appointments (customer_id);
create index if not exists appointments_pet_id_idx on appointments (pet_id);
create index if not exists appointments_contact_id_idx on appointments (contact_id);
create index if not exists appointments_scheduled_at_idx on appointments (scheduled_at);
create index if not exists appointments_content_hash_idx on appointments (content_hash);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  external_service_id text,
  customer_id uuid references customers (id) on delete set null,
  pet_id uuid references pets (id) on delete set null,
  contact_id uuid references contacts (id) on delete set null,
  service_date date not null,
  service_name text,
  employee_name text,
  amount numeric(12, 2),
  status text,
  source_system text not null default 'clube04',
  raw_data jsonb,
  content_hash text,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, external_service_id)
);

create index if not exists services_customer_id_idx on services (customer_id);
create index if not exists services_pet_id_idx on services (pet_id);
create index if not exists services_contact_id_idx on services (contact_id);
create index if not exists services_service_date_idx on services (service_date);
create index if not exists services_content_hash_idx on services (content_hash);

create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  external_package_id text,
  customer_id uuid references customers (id) on delete set null,
  pet_id uuid references pets (id) on delete set null,
  contact_id uuid references contacts (id) on delete set null,
  package_name text,
  package_type text,
  total_quantity integer check (total_quantity is null or total_quantity >= 0),
  used_quantity integer check (used_quantity is null or used_quantity >= 0),
  remaining_quantity integer check (remaining_quantity is null or remaining_quantity >= 0),
  purchase_date date,
  first_use_date date,
  last_use_date date,
  status package_status not null default 'desconhecido',
  total_amount numeric(12, 2),
  unit_amount numeric(12, 2),
  source_system text not null default 'clube04',
  raw_data jsonb,
  content_hash text,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, external_package_id)
);

create index if not exists packages_customer_id_idx on packages (customer_id);
create index if not exists packages_pet_id_idx on packages (pet_id);
create index if not exists packages_contact_id_idx on packages (contact_id);
create index if not exists packages_status_idx on packages (status);
create index if not exists packages_content_hash_idx on packages (content_hash);

create table if not exists crm_interactions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts (id) on delete set null,
  lead_id uuid references leads (id) on delete set null,
  customer_id uuid references customers (id) on delete set null,
  pet_id uuid references pets (id) on delete set null,
  interaction_type text not null,
  channel text,
  responsible text,
  result text,
  notes text,
  next_action_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_interactions_contact_id_idx on crm_interactions (contact_id);
create index if not exists crm_interactions_lead_id_idx on crm_interactions (lead_id);
create index if not exists crm_interactions_customer_id_idx on crm_interactions (customer_id);
create index if not exists crm_interactions_pet_id_idx on crm_interactions (pet_id);
create index if not exists crm_interactions_next_action_at_idx on crm_interactions (next_action_at);

create table if not exists pet_crm_status (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets (id) on delete cascade,
  customer_id uuid references customers (id) on delete set null,
  contact_id uuid references contacts (id) on delete set null,
  last_service_date date,
  days_since_last_service integer,
  next_appointment_at timestamptz,
  days_until_next_appointment integer,
  registered_frequency_days integer,
  real_frequency_avg_days numeric(8, 2),
  real_frequency_median_days numeric(8, 2),
  expected_return_date date,
  days_late integer,
  recurrence_range text check (recurrence_range is null or recurrence_range in ('0-30', '31-60', '61-90', '+90')),
  crm_status text,
  priority integer,
  recommended_action text,
  calculated_at timestamptz not null default now(),
  unique (pet_id)
);

create index if not exists pet_crm_status_pet_id_idx on pet_crm_status (pet_id);
create index if not exists pet_crm_status_customer_id_idx on pet_crm_status (customer_id);
create index if not exists pet_crm_status_contact_id_idx on pet_crm_status (contact_id);
create index if not exists pet_crm_status_expected_return_date_idx on pet_crm_status (expected_return_date);

create table if not exists action_items (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  priority integer not null default 0,
  contact_id uuid references contacts (id) on delete set null,
  lead_id uuid references leads (id) on delete set null,
  customer_id uuid references customers (id) on delete set null,
  pet_id uuid references pets (id) on delete set null,
  package_id uuid references packages (id) on delete set null,
  title text not null,
  reason text,
  recommended_action text,
  due_at timestamptz,
  status action_item_status not null default 'pendente',
  assigned_to text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists action_items_contact_id_idx on action_items (contact_id);
create index if not exists action_items_lead_id_idx on action_items (lead_id);
create index if not exists action_items_customer_id_idx on action_items (customer_id);
create index if not exists action_items_pet_id_idx on action_items (pet_id);
create index if not exists action_items_package_id_idx on action_items (package_id);
create index if not exists action_items_status_due_at_idx on action_items (status, due_at);

create table if not exists sync_state (
  id uuid primary key default gen_random_uuid(),
  source_name text,
  last_success_at timestamptz,
  last_attempt_at timestamptz,
  last_cursor text,
  last_date_from date,
  last_date_to date,
  status sync_status not null default 'idle',
  error_message text,
  updated_at timestamptz not null default now()
);

alter table sync_state add column if not exists source_name text;
alter table sync_state add column if not exists last_success_at timestamptz;
alter table sync_state add column if not exists last_attempt_at timestamptz;
alter table sync_state add column if not exists last_cursor text;
alter table sync_state add column if not exists last_date_from date;
alter table sync_state add column if not exists last_date_to date;
alter table sync_state add column if not exists status sync_status not null default 'idle';
alter table sync_state add column if not exists error_message text;
alter table sync_state add column if not exists updated_at timestamptz not null default now();

create unique index if not exists sync_state_source_name_uidx
  on sync_state (source_name)
  where source_name is not null;

create index if not exists sync_state_source_name_idx on sync_state (source_name);

create table if not exists sync_logs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  source_name text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status sync_status not null default 'running',
  records_read integer not null default 0,
  records_created integer not null default 0,
  records_updated integer not null default 0,
  records_skipped integer not null default 0,
  error_message text,
  metadata jsonb
);

create index if not exists sync_logs_job_name_idx on sync_logs (job_name);
create index if not exists sync_logs_source_name_idx on sync_logs (source_name);
create index if not exists sync_logs_started_at_idx on sync_logs (started_at);

create table if not exists raw_imports (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  entity_type text not null,
  external_id text,
  content_hash text not null,
  raw_payload jsonb not null,
  imported_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_status processing_status not null default 'pending',
  error_message text,
  unique (source_name, entity_type, external_id)
);

create index if not exists raw_imports_source_name_idx on raw_imports (source_name);
create index if not exists raw_imports_content_hash_idx on raw_imports (content_hash);
create index if not exists raw_imports_processing_status_idx on raw_imports (processing_status);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'contacts',
    'leads',
    'conversations',
    'customers',
    'pets',
    'appointments',
    'services',
    'packages',
    'crm_interactions',
    'action_items'
  ]
  loop
    execute format('drop trigger if exists %I_set_updated_at on %I', table_name, table_name);
    execute format(
      'create trigger %I_set_updated_at before update on %I for each row execute function set_updated_at()',
      table_name,
      table_name
    );
  end loop;

  drop trigger if exists sync_state_set_updated_at on sync_state;
  create trigger sync_state_set_updated_at
    before update on sync_state
    for each row
    execute function set_updated_at();
end $$;
