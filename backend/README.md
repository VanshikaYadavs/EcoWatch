# EcoWatch Backend (Node + Express + Supabase)

Backend API and services for ingestion, alerting, and scheduled checks. Includes Email (SendGrid) and SMS (Twilio) notifications, plus a background scheduler.

## Setup

1) Copy env and fill values

```bash
cp .env.example .env
```

Required:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Recommended/Optional:
- `PORT` (default 8080)
- `FRONTEND_ORIGIN` (default http://localhost:5173)
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `WAQI_TOKEN`, `OPENWEATHER_API_KEY`
- `ALERT_CHECK_INTERVAL_MS` (default: 3600000), `DEFAULT_LOCATIONS` (JSON array)
- `ALLOW_DEMO_INGEST` (set `1` in dev to allow demo mode), `DEFAULT_USER_ID`

2) Install and run

```bash
npm install
npm run dev
```

3) Optional services

```bash
npm run scheduler   # start background alert checker
npm run ingest      # CLI ingest for default locations
```

## API Endpoints

- `GET /health` — service status
- `GET /api/ping` — quick ping
- `GET /api/check-supabase` — verify DB connectivity
- `GET /api/readings/latest` — latest readings (query: `location`, `limit`)
- `POST /api/readings` — insert environment reading (trusted server path)
- `GET /api/readings/latest-by-city` — latest per configured city
- `GET /api/readings/latest-by-cluster?name=...` — latest per city for a cluster
- `GET /api/ingest/now?name=...&lat=...&lon=...&demo=1` — one-off ingest (auth/demo)
- `GET /api/ingest/all` — parallel ingest for default cities
- `GET /api/ingest/cluster?name=...` — ingest all cities in a cluster
- `GET /api/ingest/clusters` — ingest all clusters in parallel

On inserts, alert evaluation runs and writes triggered items to `alert_events`.

### Insert body example

```json
{
  "location": "Jaipur",
  "latitude": 26.9124,
  "longitude": 75.7873,
  "aqi": 150,
  "temperature": 35.2,
  "humidity": 80,
  "noise_level": 85,
  "source": "api",
  "recorded_at": "2026-01-12T10:00:00Z"
}
```

## Notifications

- Email: [backend/src/email.mjs](backend/src/email.mjs) (SendGrid; rate-limited)
- SMS: [backend/src/smsService.mjs](backend/src/smsService.mjs) (Twilio)
- Alerts: [backend/src/alerts.mjs](backend/src/alerts.mjs)
- Scheduler: [backend/scheduler.mjs](backend/scheduler.mjs) — see [SCHEDULER_README.md](../SCHEDULER_README.md)

## Database

Apply schema and policies in Supabase:
- [database/schema.sql](../database/schema.sql)
- [database/policies.sql](../database/policies.sql)

Migrations: see [database/migrations](../database/migrations)

## Ingestion (CLI)

Run ingestion for default locations from `.env`:

```bash
npm run ingest
```

`DEFAULT_LOCATIONS` example:

```json
[
  { "name": "Jaipur", "lat": 26.9124, "lon": 75.7873 },
  { "name": "Udaipur", "lat": 24.5854, "lon": 73.7125 }
]
```

Schedule with Task Scheduler/PM2 or a hosted cron.

## Development Tips

- For local testing without auth, set `ALLOW_DEMO_INGEST=1` and use `&demo=1` on ingest endpoints.
- Keep service role keys server-side only; never expose them to the frontend.
