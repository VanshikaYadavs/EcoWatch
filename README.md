# EcoWatch

EcoWatch is an environmental monitoring web app for tracking and visualizing metrics like air quality, noise levels, and temperature across locations.

This repository currently contains the **frontend** (Vite + React + Tailwind). The **backend** and **database** sections below describe the intended architecture and how to wire things up—especially if you choose **Supabase**.

---

## Monorepo Structure

```text
EcoWatch/
  frontend/                # React + Vite client
  backend/                 # (planned) API / services
  database/                # (planned) migrations / schema docs
```

> Note: `backend/` and `database/` are not in the repo yet. You can add them later without changing the frontend setup.

---

## Features (Current / Intended)

- Dashboards for environmental metrics and quick stats
- Air Quality Monitor (AQI views, comparisons)
- Noise Level Tracking (realtime-style UI, comparisons)
- Temperature Analytics
- Historical Reports and Comparative Analysis
- User profile and notification settings

---

## Tech Stack

### Frontend (in this repo)
- React + Vite
- Tailwind CSS
- Client-side routing

### Backend (planned)
You can choose one of these patterns:
- **Supabase-first (recommended for MVP):** use Supabase Auth + Postgres + Row Level Security (RLS), and optionally Edge Functions for server logic.
- **Custom API:** Node.js (Express/NestJS) or Python (FastAPI) as a separate `backend/` service.

### Database (planned)
- **Supabase Postgres** (managed Postgres + Auth + Storage)

---

## Getting Started (Frontend)

### Prerequisites
- Node.js (LTS recommended)
- npm (comes with Node)

### Install

```bash
cd frontend
npm install
```

### Run locally

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`).

### Build

```bash
npm run build
npm run preview
```

---

## Environment Variables

The frontend should keep secrets out of git. This repo ignores `frontend/.env`.

Create a file at:
- `frontend/.env`

If using Supabase, add:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Keep service-role keys on the server only (never in the browser).

---

## Supabase Setup (Suggested)

### 1) Create a Supabase project
- Create a project in Supabase
- Note your Project URL and anon key

### 2) Auth (optional but recommended)
- Enable Email/Password auth (or OAuth providers)
- Use RLS policies so each user only sees allowed data

### 3) Suggested data model (example)
This is an example schema you can adapt. It’s intentionally minimal:

- `locations`
  - `id` (uuid, pk)
  - `name` (text)
  - `city` (text)
  - `state` (text)
  - `lat` / `lng` (numeric)

- `sensors`
  - `id` (uuid, pk)
  - `location_id` (uuid, fk -> locations.id)
  - `type` (text)  // e.g. "air", "noise", "temp"
  - `label` (text)

- `readings`
  - `id` (uuid, pk)
  - `sensor_id` (uuid, fk -> sensors.id)
  - `timestamp` (timestamptz)
  - `metric` (text)     // e.g. "pm25", "aqi", "db", "temp_c"
  - `value` (numeric)
  - `unit` (text)

- `alerts`
  - `id` (uuid, pk)
  - `user_id` (uuid, fk -> auth.users)
  - `metric` (text)
  - `threshold` (numeric)
  - `comparison` (text) // e.g. ">", "<="
  - `enabled` (boolean)

Indexes to consider:
- `readings (sensor_id, timestamp desc)`
- `readings (metric, timestamp desc)`

### 4) Realtime (optional)
If you want “live” dashboards, Supabase Realtime can stream inserts/updates from tables (often `readings`).

---

## Backend (When You Add It)

If you decide to add a backend service in `backend/`, it usually handles:
- Writing sensor readings (so clients can’t spoof data)
- Aggregations (hourly/daily rollups)
- Alerts evaluation + notifications
- Secrets (e.g., Supabase service key, third-party APIs)

Common approaches:
- **Supabase Edge Functions** for lightweight server logic
- **Node/Express or FastAPI** when you need a fuller service

---

## Deployment (Typical)

- Frontend: Vercel / Netlify / Azure Static Web Apps
- Backend (if used): Render / Fly.io / Azure App Service / Supabase Edge Functions
- Database: Supabase

---

## Contributing

1. Create a new branch
2. Make changes
3. Open a Pull Request

---

## License

Add a license if you plan to open-source this project.
