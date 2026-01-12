-- Create nearby_environment_readings table
create table if not exists public.nearby_environment_readings (
  id uuid primary key default gen_random_uuid(),
  location text,
  latitude double precision,
  longitude double precision,
  aqi integer,
  temperature double precision,
  humidity double precision,
  noise_level double precision,
  source text,
  user_id uuid,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_nearby_env_readings_recorded_at on public.nearby_environment_readings (recorded_at desc);
create index if not exists idx_nearby_env_readings_location_ts on public.nearby_environment_readings (location, recorded_at desc);
create index if not exists idx_nearby_env_readings_user_ts on public.nearby_environment_readings (user_id, recorded_at desc);
