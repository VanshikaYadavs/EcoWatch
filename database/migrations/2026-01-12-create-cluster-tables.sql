-- Create cluster tables to store per-city readings within each cluster
create table if not exists public.noida_cluster_readings (
  id uuid default gen_random_uuid() primary key,
  city text,
  station_name text,
  latitude double precision,
  longitude double precision,
  aqi integer,
  pm25 double precision,
  pm10 double precision,
  o3 double precision,
  no2 double precision,
  recorded_at timestamptz default now()
);

create table if not exists public.yamunapuram_cluster_readings (
  id uuid default gen_random_uuid() primary key,
  city text,
  station_name text,
  latitude double precision,
  longitude double precision,
  aqi integer,
  pm25 double precision,
  pm10 double precision,
  o3 double precision,
  no2 double precision,
  recorded_at timestamptz default now()
);

create table if not exists public.jaipur_cluster_readings (
  id uuid default gen_random_uuid() primary key,
  city text,
  station_name text,
  latitude double precision,
  longitude double precision,
  aqi integer,
  pm25 double precision,
  pm10 double precision,
  o3 double precision,
  no2 double precision,
  recorded_at timestamptz default now()
);

create index if not exists idx_noida_cluster_city_ts on public.noida_cluster_readings (city, recorded_at desc);
create index if not exists idx_yamunapuram_cluster_city_ts on public.yamunapuram_cluster_readings (city, recorded_at desc);
create index if not exists idx_jaipur_cluster_city_ts on public.jaipur_cluster_readings (city, recorded_at desc);

-- Refresh API schema cache
notify pgrst, 'reload schema';
