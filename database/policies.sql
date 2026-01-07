-- Enable RLS on all tables
alter table organizations enable row level security;
alter table locations enable row level security;
alter table sensors enable row level security;
alter table readings enable row level security;
alter table alerts enable row level security;
alter table profiles enable row level security;
alter table environment_readings enable row level security;
alter table user_alert_preferences enable row level security;
alter table alert_events enable row level security;

-- Basic policies
-- Organizations: read-only to authenticated users; writes by service role only
create policy if not exists orgs_read_auth on organizations for select
  to authenticated using (true);
create policy if not exists orgs_write_service_role on organizations for all
  to authenticated using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Locations: readable to authenticated; writes by service role only
create policy if not exists locations_read_auth on locations for select
  to authenticated using (true);
create policy if not exists locations_write_service_role on locations for all
  to authenticated using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Sensors: readable to authenticated; writes by service role only
create policy if not exists sensors_read_auth on sensors for select
  to authenticated using (true);
create policy if not exists sensors_write_service_role on sensors for all
  to authenticated using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Readings: readable to authenticated; inserts by service role only
create policy if not exists readings_read_auth on readings for select
  to authenticated using (true);
create policy if not exists readings_insert_service_role on readings for insert
  to authenticated with check (auth.role() = 'service_role');
create policy if not exists readings_update_delete_service_role on readings for update using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Alerts: users can read/write their own; service role can do all
create policy if not exists alerts_own_read on alerts for select
  to authenticated using (user_id = auth.uid() or auth.role() = 'service_role');
create policy if not exists alerts_own_write on alerts for insert
  to authenticated with check (user_id = auth.uid() or auth.role() = 'service_role');
create policy if not exists alerts_own_update on alerts for update
  to authenticated using (user_id = auth.uid() or auth.role() = 'service_role') with check (user_id = auth.uid() or auth.role() = 'service_role');
create policy if not exists alerts_own_delete on alerts for delete
  to authenticated using (user_id = auth.uid() or auth.role() = 'service_role');

-- Profiles: users can read/update their own; service role can do all
create policy if not exists profiles_read_own on profiles for select
  to authenticated using (id = auth.uid() or auth.role() = 'service_role');
create policy if not exists profiles_update_own on profiles for update
  to authenticated using (id = auth.uid() or auth.role() = 'service_role')
  with check (id = auth.uid() or auth.role() = 'service_role');
create policy if not exists profiles_insert_service_role on profiles for insert
  to authenticated with check (auth.role() = 'service_role');

-- Environment readings: public/anonymized reads; service role writes
create policy if not exists env_readings_read_anon on environment_readings for select
  to anon using (true);
create policy if not exists env_readings_read_auth on environment_readings for select
  to authenticated using (true);
create policy if not exists env_readings_write_service_role on environment_readings for all
  to authenticated using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- User alert preferences: owner can read/write; service role can do all
create policy if not exists prefs_read_own on user_alert_preferences for select
  to authenticated using (user_id = auth.uid() or auth.role() = 'service_role');
create policy if not exists prefs_insert_own on user_alert_preferences for insert
  to authenticated with check (user_id = auth.uid() or auth.role() = 'service_role');
create policy if not exists prefs_update_own on user_alert_preferences for update
  to authenticated using (user_id = auth.uid() or auth.role() = 'service_role')
  with check (user_id = auth.uid() or auth.role() = 'service_role');
create policy if not exists prefs_delete_own on user_alert_preferences for delete
  to authenticated using (user_id = auth.uid() or auth.role() = 'service_role');

-- Alert events: users can read their own; service role can write
create policy if not exists alerts_events_read_own on alert_events for select
  to authenticated using (user_id = auth.uid() or auth.role() = 'service_role');
create policy if not exists alerts_events_insert_service_role on alert_events for insert
  to authenticated with check (auth.role() = 'service_role');
