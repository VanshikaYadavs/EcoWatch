-- Migration: add phone column to public.profiles and backfill from auth metadata
alter table public.profiles add column if not exists phone text;

-- Backfill from auth.users metadata when available
update public.profiles p
set phone = au.raw_user_meta_data->>'phone',
    updated_at = now()
from auth.users au
where au.id = p.id
  and (p.phone is null or p.phone = '')
  and (au.raw_user_meta_data->>'phone') is not null;
