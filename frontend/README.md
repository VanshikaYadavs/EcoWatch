# EcoWatch Frontend (React + Vite + Tailwind)

Modern UI for monitoring environmental data, configuring alerts, and viewing dashboards. Includes i18n and optional auto-translation.

## Features

- Dashboards: Air Quality, Noise Tracking, Temperature Analytics, Historical Reports
- Alert Center: lists, filters, timelines, statistics, configuration
- Auth callback, profile setup, notification settings
- i18n via [src/i18n.js](src/i18n.js); optional auto-translate utilities
- Tailwind-based components and layouts

## Prerequisites

- Node.js (LTS)
- npm

## Installation

```bash
npm install
npm run dev
```

Vite dev server will print a local URL (typically http://localhost:5173).

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run preview` — preview built app locally

## Environment Variables

See [frontend/.env.example](../frontend/.env.example). Create `frontend/.env` with:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GOOGLE_TRANSLATE_API_KEY=...   # optional
VITE_API_URL=http://localhost:8080   # backend URL
```

## Structure (selected)

```
src/
  components/
    navigation/
    ui/
    Chatbot.jsx
  layouts/
  pages/
    alert-center/
    air-quality-monitor/
    environmental-dashboard/
    historical-reports/
    noise-level-tracking/
    notification-setting/
    profile-setup/
    temperature-analytics/
    unsigned-dashboard/
    auth-callback/
  services/
  utils/
    translationService.js
    useAutoTranslate.js
    profiles.js
    nearbyCities.js
    sessionCities.js
  i18n.js
```

## Backend Integration

Set `VITE_API_URL` to your backend (default: http://localhost:8080). CORS is allowed from `FRONTEND_ORIGIN` configured in backend `.env`.

## i18n / Auto-Translation

- Base i18n setup in [src/i18n.js](src/i18n.js)
- Optional helpers: [src/utils/translationService.js](src/utils/translationService.js), [src/utils/useAutoTranslate.js](src/utils/useAutoTranslate.js)

## Deployment

```bash
npm run build
npm run preview
```

