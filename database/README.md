# Database

Supabase Postgres schema, policies, and migrations for EcoWatch.

## Files

- [schema.sql](schema.sql) — core tables (`environment_readings`, clusters, nearby tables, etc.)
- [policies.sql](policies.sql) — RLS policies for safe access
- [migrations/](migrations/) — incremental changes
  - `2026-01-11-add-user-id.sql` — add `user_id` to `environment_readings`
  - `2026-01-12-add-phone-to-profiles.sql` — phone number for SMS
  - `2026-01-12-add-pollutants.sql` — pollutant fields (pm25, pm10, o3, no2)
  - `2026-01-12-create-cluster-tables.sql` — cluster tables for regions
  - `2026-01-12-create-nearby-environment-readings.sql` — per-user nearby readings

Additional helpers:
- [add_sms_support.sql](add_sms_support.sql) — SMS channel columns and indexes

## Apply Schema & Policies

In Supabase SQL editor:

1. Run [schema.sql](schema.sql)
2. Run [policies.sql](policies.sql)
3. Apply needed migrations from [migrations](migrations)

## Cache Refresh (PostgREST)

If you see errors like “Could not find the `user_id` column” after applying DDL, refresh the API schema cache:

1. Supabase → Settings → API → Restart API / Refresh Schema Cache
2. Alternatively, wait ~60 seconds; the cache auto-refreshes

## Notes

- RLS restricts reads to `auth.uid()` where appropriate; server inserts/updates use the service role
- Scheduler/ingestion populate readings and pollutant fields; alerts are recorded in `alert_events`
- Cluster tables store latest readings per city/region to power comparative dashboards
