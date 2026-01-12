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

-- User profiles (linked to Supabase auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text check (role in ('admin','official','researcher','analyst','leader','viewer')) default 'viewer',
  organization text,
  phone text,
  updated_at timestamptz not null default now()
);

-- Backfill/migration safety for existing databases
alter table profiles add column if not exists phone text;

-- Compact, denormalized environmental snapshots (publicly readable by default)
create table if not exists environment_readings (
  id uuid primary key default gen_random_uuid(),
  location text,
  latitude double precision,
  longitude double precision,
  aqi integer,
  pm25 double precision,
  pm10 double precision,
  o3 double precision,
  no2 double precision,
  temperature double precision,
  humidity double precision,
  noise_level double precision,
  source text,
  -- Optional per-user isolation; populated by backend using service role
  user_id uuid,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Nearby station/environment readings (per-user, similar schema)
create table if not exists nearby_environment_readings (
  id uuid primary key default gen_random_uuid(),
  location text,
  latitude double precision,
  longitude double precision,
  aqi integer,
  pm25 double precision,
  pm10 double precision,
  o3 double precision,
  no2 double precision,
  temperature double precision,
  humidity double precision,
  noise_level double precision,
  source text,
  user_id uuid,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_nearby_env_readings_recorded_at on nearby_environment_readings (recorded_at desc);
create index if not exists idx_nearby_env_readings_location_ts on nearby_environment_readings (location, recorded_at desc);
create index if not exists idx_nearby_env_readings_user_ts on nearby_environment_readings (user_id, recorded_at desc);

-- Backfill/migration safety
alter table nearby_environment_readings add column if not exists user_id uuid;
alter table environment_readings add column if not exists pm25 double precision;
alter table environment_readings add column if not exists pm10 double precision;
alter table environment_readings add column if not exists o3 double precision;
alter table environment_readings add column if not exists no2 double precision;
alter table nearby_environment_readings add column if not exists pm25 double precision;
alter table nearby_environment_readings add column if not exists pm10 double precision;
alter table nearby_environment_readings add column if not exists o3 double precision;
alter table nearby_environment_readings add column if not exists no2 double precision;

-- Per-user alert preferences
create table if not exists user_alert_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  aqi_threshold integer,
  noise_threshold double precision,
  temp_threshold double precision,
  email_alerts boolean not null default true,
  created_at timestamptz not null default now()
);

-- Helpful indexes for environment_readings
create index if not exists idx_env_readings_recorded_at on environment_readings (recorded_at desc);
create index if not exists idx_env_readings_location_ts on environment_readings (location, recorded_at desc);
-- Helpful index for multi-user isolation queries
create index if not exists idx_env_readings_user_ts on environment_readings (user_id, recorded_at desc);

-- Backfill/migration safety: ensure column exists in existing databases
alter table environment_readings add column if not exists user_id uuid;
-- Optional FK constraint to auth.users (may require privileges); safe to skip if not desired
-- Note: Postgres lacks IF NOT EXISTS for constraints; apply manually if needed.

-- Alert events (triggered alerts log)
create table if not exists alert_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,              -- 'AQI' | 'NOISE' | 'HEAT'
  value double precision,
  message text,
  location text,
  recorded_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_alert_events_user_ts on alert_events (user_id, created_at desc);

-- --------------------------------------------------
-- Cluster tables for hackathon multi-city ingestion
-- Each table stores readings for multiple cities in its cluster
-- --------------------------------------------------

create table if not exists noida_cluster_readings (
  id uuid primary key default gen_random_uuid(),
  city text,
  station_name text,
  latitude double precision,
  longitude double precision,
  aqi integer,
  pm25 double precision,
  pm10 double precision,
  o3 double precision,
  no2 double precision,
  recorded_at timestamptz not null default now()
);

create table if not exists yamunapuram_cluster_readings (
  id uuid primary key default gen_random_uuid(),
  city text,
  station_name text,
  latitude double precision,
  longitude double precision,
  aqi integer,
  pm25 double precision,
  pm10 double precision,
  o3 double precision,
  no2 double precision,
  recorded_at timestamptz not null default now()
);

create table if not exists jaipur_cluster_readings (
  id uuid primary key default gen_random_uuid(),
  city text,
  station_name text,
  latitude double precision,
  longitude double precision,
  aqi integer,
  pm25 double precision,
  pm10 double precision,
  o3 double precision,
  no2 double precision,
  recorded_at timestamptz not null default now()
);

create index if not exists idx_noida_cluster_city_ts on noida_cluster_readings (city, recorded_at desc);
create index if not exists idx_yamunapuram_cluster_city_ts on yamunapuram_cluster_readings (city, recorded_at desc);
create index if not exists idx_jaipur_cluster_city_ts on jaipur_cluster_readings (city, recorded_at desc);

-- Backfill-safe adds in case tables existed previously without station_name
alter table noida_cluster_readings add column if not exists station_name text;
alter table yamunapuram_cluster_readings add column if not exists station_name text;
alter table jaipur_cluster_readings add column if not exists station_name text;
