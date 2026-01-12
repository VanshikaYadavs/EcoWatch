-- Add pollutant breakdown columns to environment tables
alter table public.environment_readings
  add column if not exists pm25 double precision,
  add column if not exists pm10 double precision,
  add column if not exists o3 double precision,
  add column if not exists no2 double precision;

alter table public.nearby_environment_readings
  add column if not exists pm25 double precision,
  add column if not exists pm10 double precision,
  add column if not exists o3 double precision,
  add column if not exists no2 double precision;

-- Refresh PostgREST schema cache (Supabase)
notify pgrst, 'reload schema';
