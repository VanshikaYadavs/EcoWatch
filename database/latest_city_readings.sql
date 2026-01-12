-- Creates or replaces a view that exposes the latest reading per city/location
create or replace view public.latest_city_readings as
select distinct on (location)
  id,
  location,
  latitude,
  longitude,
  aqi,
  temperature,
  humidity,
  noise_level,
  source,
  recorded_at
from public.environment_readings
where location is not null
order by location, recorded_at desc;

-- Grant read to anon/auth if needed (adjust to your RLS model)
-- grant select on public.latest_city_readings to anon, authenticated;
