-- Complete Email and SMS Alert Setup
-- Run this to ensure all columns and triggers are properly configured

-- 1. Add email column to profiles if not exists
alter table profiles 
add column if not exists email text;

-- 2. Add phone_number column to profiles if not exists
alter table profiles 
add column if not exists phone_number text;

-- 3. Add sms_alerts to user_alert_preferences
alter table user_alert_preferences 
add column if not exists sms_alerts boolean not null default false;

-- 4. Add humidity_threshold to user_alert_preferences
alter table user_alert_preferences 
add column if not exists humidity_threshold double precision;

-- 5. Create indexes for performance
create index if not exists idx_profiles_email on profiles (email);
create index if not exists idx_profiles_phone on profiles (phone_number);

-- 6. Create or replace email sync function
create or replace function sync_user_email()
returns trigger as $$
begin
  insert into public.profiles (id, email, updated_at)
  values (new.id, new.email, now())
  on conflict (id)
  do update set
    email = new.email,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- 7. Drop and recreate triggers
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure sync_user_email();

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute procedure sync_user_email();

-- 8. Backfill existing emails from auth.users to profiles
update public.profiles
set email = auth.users.email,
    updated_at = now()
from auth.users
where profiles.id = auth.users.id
  and (profiles.email is null or profiles.email = '');

-- 9. Add comments for documentation
comment on column profiles.email is 'User email for alert notifications (synced from auth.users)';
comment on column profiles.phone_number is 'User phone number for SMS alerts (E.164 format: +911234567890)';
comment on column user_alert_preferences.sms_alerts is 'Enable SMS notifications when environmental thresholds are exceeded';
comment on column user_alert_preferences.humidity_threshold is 'Humidity percentage threshold for alerts (e.g., 80 for 80%)';
comment on column user_alert_preferences.email_alerts is 'Enable email notifications when environmental thresholds are exceeded';

-- 10. Display summary
do $$
declare
  email_count int;
  phone_count int;
  prefs_count int;
begin
  select count(*) into email_count from profiles where email is not null;
  select count(*) into phone_count from profiles where phone_number is not null;
  select count(*) into prefs_count from user_alert_preferences;
  
  raise notice '✅ Migration complete!';
  raise notice 'Profiles with email: %', email_count;
  raise notice 'Profiles with phone: %', phone_count;
  raise notice 'Alert preferences: %', prefs_count;
end $$;
