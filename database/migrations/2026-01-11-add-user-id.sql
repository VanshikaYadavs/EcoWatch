-- Add user_id column to environment_readings and supporting index
alter table environment_readings add column if not exists user_id uuid;
create index if not exists idx_env_readings_user_ts on environment_readings (user_id, recorded_at desc);

-- Optional: add FK to auth.users (requires elevated privileges)
-- alter table environment_readings
--   add constraint env_readings_user_fk
--   foreign key (user_id) references auth.users(id) on delete set null;
