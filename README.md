# EcoWatch

EcoWatch is an environmental monitoring platform with dashboards, alerting, and ingestion for air quality, noise levels, temperature, and humidity. This monorepo contains the frontend, backend API, and database schema/migrations.

---

## Monorepo Structure

```text
EcoWatch/
  frontend/    # React + Vite + Tailwind UI (i18n, routes, dashboards)
  backend/     # Node + Express API, scheduler, ingestion, SMS/Email alerts
  database/    # Supabase SQL schema, RLS policies, migrations
```

---

## Highlights

- Dashboards: Air Quality, Noise Tracking, Temperature Analytics, Historical Reports
- Alert Center: thresholds, channels, timelines, statistics
- Notifications: Email (SendGrid) and SMS (Twilio)
- Ingestion: WAQI + OpenWeather APIs with cluster and nearby tables
- Scheduler: background checks and alert evaluation
- i18n and auto-translation support (optional Google Cloud Translate)

---

## Tech Stack

- Frontend: React (Vite), Tailwind CSS, React Router
- Backend: Node + Express, Supabase server client, cron scheduler
- Database: Supabase Postgres with RLS

---

## Quickstart

### Frontend

Prerequisites: Node.js (LTS), npm

```bash
cd frontend
npm install
npm run dev
```

Configure variables in [frontend/.env.example](frontend/.env.example); create `frontend/.env` as needed.

### Backend

```bash
cd backend
npm install
cp .env.example .env   # add your keys
npm run dev            # start API at http://localhost:8080
```

Key environment variables:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_ORIGIN` (default: http://localhost:5173)
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` (email alerts)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (SMS alerts)
- `WAQI_TOKEN`, `OPENWEATHER_API_KEY` (ingestion)
- `ALERT_CHECK_INTERVAL_MS`, `DEFAULT_LOCATIONS` (scheduler)

Scheduler and ingestion:
```bash
npm run scheduler   # background alert checker
npm run ingest      # one-off CLI ingest for defaults
```

### Database

Apply schema and policies in Supabase:
- [database/schema.sql](database/schema.sql)
- [database/policies.sql](database/policies.sql)

Migrations available in [database/migrations](database/migrations):
- Add `user_id`, phone support, pollutants, cluster and nearby tables

Troubleshooting PostgREST schema cache: see [database/README.md](database/README.md).

---

## Backend API (Key Endpoints)

- `GET /health` — Service status
- `GET /api/ping` — Ping test
- `GET /api/check-supabase` — Verify DB connectivity
- `GET /api/readings/latest` — Latest readings (query by `location`, `limit`)
- `POST /api/readings` — Insert a reading (server‑trusted)
- `GET /api/readings/latest-by-city` — Latest per configured city
- `GET /api/readings/latest-by-cluster?name=...` — Latest per city for a cluster
- `GET /api/ingest/now?name=...&lat=...&lon=...` — One‑off ingest (auth/demo)
- `GET /api/ingest/all` — Parallel ingest for default city set
- `GET /api/ingest/cluster?name=...` — Ingest all cities in a cluster
- `GET /api/ingest/clusters` — Ingest all clusters in parallel

See [backend/README.md](backend/README.md) for details.

---

## Contributing

1. Create a branch
2. Make changes
3. Open a Pull Request

---

## License

Add a license if you plan to open‑source this project.
