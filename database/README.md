# Database Migrations

## Fix: "Could not find the 'user_id' column of 'environment_readings' in the schema cache"

This error occurs when the Supabase PostgREST schema cache does not see the new `user_id` column yet.

### Steps
1. Open Supabase Dashboard → SQL editor.
2. Run the migration script:
   - Copy contents of `database/migrations/2026-01-11-add-user-id.sql`, or paste:
```
alter table environment_readings add column if not exists user_id uuid;
create index if not exists idx_env_readings_user_ts on environment_readings (user_id, recorded_at desc);
```
3. Refresh PostgREST schema cache:
   - Dashboard → Settings → API → Restart API (or "Refresh schema cache")
   - If the UI differs, wait ~60s and try again; the cache auto-refreshes after DDL.
4. Re-test ingestion from the frontend while signed in.

### Notes
- RLS policies in `database/policies.sql` restrict reads to `user_id = auth.uid()`.
- Backend inserts the `user_id` automatically using your Supabase JWT.
