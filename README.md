# EcoWatch

EcoWatch is an environmental monitoring web app for tracking and visualizing metrics like air quality, noise levels, and temperature across locations.

This repository currently contains the **frontend** (Vite + React + Tailwind). The **backend** and **database** sections below describe the intended architecture and how to wire things up—especially if you choose **Supabase**.

---

## Monorepo Structure

```text
EcoWatch/
  frontend/                # React + Vite client
  backend/                 # Node + Express API (Supabase server client)
  database/                # Supabase schema + RLS policies
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

### Backend
This repo includes a minimal Node + Express service in `backend/` using a server-side Supabase client (service role) for secure operations. You can also complement with Supabase Edge Functions later if needed.

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

### 4) Apply schema + policies
In Supabase SQL editor, run the contents of:
- `database/schema.sql`
- `database/policies.sql`

This creates the core tables and enables safe defaults (RLS). Client read access is allowed for most reference data; inserts/updates require the service role or ownership where applicable (see policies).

### 5) Realtime (optional)
If you want “live” dashboards, Supabase Realtime can stream inserts/updates from tables (often `readings`).

---

## Backend

The `backend/` service typically handles:
- Writing sensor readings (so clients can’t spoof data)
- Aggregations (hourly/daily rollups)
- Alerts evaluation + notifications
- Secrets (e.g., Supabase service key, third-party APIs)

Common approaches:
- The included **Node/Express** server (with Supabase server client)
- **Supabase Edge Functions** for lightweight server logic

---

## Backend Quickstart

1) Configure environment

Create `backend/.env` from the example and fill values:

```bash
cp backend/.env.example backend/.env
```

Required keys:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

2) Install deps and run

```bash
cd backend
npm install
npm run dev
```

The service listens on `http://localhost:8080` by default and exposes `/health`, `/api/readings/latest`, and `/api/readings` (trusted insert path).

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
