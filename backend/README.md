# EcoWatch Backend (Node + Supabase)

Minimal Express service with a Supabase server-side client.

## Setup

1) Copy env file

```bash
cp .env.example .env
```

2) Fill `.env` values
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `SUPABASE_ANON_KEY` (optional)
- `PORT` (optional, default 8080)

3) Install dependencies

```bash
npm install
```

4) Run

```bash
npm run dev
```

## API (sample)

- `GET /health` — service status
- `GET /api/readings/latest?location_id=...&type=air&limit=50` — latest readings
- `POST /api/readings` — insert a reading (server trusted)

Body example:
```json
{
  "sensor_id": "uuid-...",
  "location_id": "uuid-...",
  "type": "air",
  "metric": "pm25",
  "value": 42.1,
  "unit": "ug/m3",
  "timestamp": "2025-01-01T10:00:00Z"
}
```

## Database

Apply schema and policies in Supabase SQL editor:
- `database/schema.sql`
- `database/policies.sql`

Consider adding scheduled jobs (Edge Functions or external cron) to ingest public APIs and evaluate alerts.
