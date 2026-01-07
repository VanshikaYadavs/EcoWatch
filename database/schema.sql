-- EcoWatch minimal schema for Supabase (Postgres)
-- Requires pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Organizations (optional for multi-tenant)
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Locations (cities/campuses/sites)
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete set null,
  name text not null,
  city text,
  state text,
  lat numeric(9,6),
  lng numeric(9,6),
  created_at timestamptz not null default now()
);

-- Sensors (optional physical or logical sources)
-- type: 'air' | 'noise' | 'temp' (not enforced strictly here)
create table if not exists sensors (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  type text not null,
  label text,
  created_at timestamptz not null default now()
);

-- Readings (time-series-like)
-- Denormalized columns (location_id, type) included for simple querying
create table if not exists readings (
  id uuid primary key default gen_random_uuid(),
  sensor_id uuid references sensors(id) on delete set null,
  location_id uuid references locations(id) on delete set null,
  type text,
  metric text not null,        -- e.g. 'pm25', 'aqi', 'db', 'temp_c'
  value numeric not null,
  unit text,                   -- e.g. 'ug/m3', 'AQI', 'dB', 'C'
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Alerts (user-defined thresholds)
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,           -- references auth.users in Supabase context
  org_id uuid references organizations(id) on delete set null,
  metric text not null,
  threshold numeric not null,
  comparison text not null,        -- '>' | '>=' | '<' | '<=' | '='
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- Useful indexes for queries
create index if not exists idx_readings_sensor_ts on readings (sensor_id, timestamp desc);
create index if not exists idx_readings_location_ts on readings (location_id, timestamp desc);
create index if not exists idx_readings_metric_ts on readings (metric, timestamp desc);
create index if not exists idx_readings_type_ts on readings (type, timestamp desc);
