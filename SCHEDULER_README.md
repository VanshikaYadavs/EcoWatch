# EcoWatch Alert Scheduler

## How It Works

The scheduler **automatically checks environmental data every hour** and sends SMS/Email alerts when thresholds are exceeded.

### Features:
✅ Runs independently (users don't need to be logged in)
✅ Fetches real-time data from APIs (WAQI, OpenWeather)
✅ Checks ALL user thresholds automatically
✅ Sends SMS alerts to users whose thresholds are exceeded
✅ Monitors multiple locations (Jaipur, Udaipur, Jodhpur, etc.)
✅ Works 24/7 in the background

### How to Run:

**Option 1: Development (stops when terminal closes)**
```bash
cd backend
npm run scheduler
```

**Option 2: Production (keeps running in background)**
```bash
cd backend
# Windows
start /B node scheduler.mjs

# Linux/Mac
nohup node scheduler.mjs &
```

**Option 3: With PM2 (recommended for production)**
```bash
npm install -g pm2
cd backend
pm2 start scheduler.mjs --name ecowatch-scheduler
pm2 save
pm2 startup  # Makes it run on system startup
```

### Configuration:

Edit `.env` file:
```env
# Check interval (default: 1 hour = 3600000 ms)
ALERT_CHECK_INTERVAL_MS=3600000

# Locations to monitor (JSON array)
DEFAULT_LOCATIONS=[{"name":"Jaipur","lat":26.9124,"lon":75.7873},{"name":"Udaipur","lat":24.5854,"lon":73.7125}]
```

### How It Works:

1. **Every hour** (configurable), the scheduler:
   - Fetches environmental data for all monitored locations
   - Stores data in `environment_readings` table
   - Automatically runs `evaluateAndRecordAlerts()` 

2. **Alert evaluation**:
   - Gets ALL users with alerts enabled (`sms_alerts=true` or `email_alerts=true`)
   - Checks if any reading exceeds their personal thresholds
   - Sends SMS/Email alerts automatically
   - Logs alerts in `alert_events` table

3. **User experience**:
   - Users set their thresholds once
   - They receive alerts automatically
   - No need to visit the website
   - Works 24/7 in the background

### Example Output:

```
🚀 EcoWatch Alert Scheduler Started
⏰ Checking every 60 minutes
📍 Monitoring 5 locations

⏱️  [2026-01-12T10:00:00Z] Running scheduled alert check...
📡 Fetching environmental data...
✅ Successfully ingested: 5/5
📱 Alerts sent in last hour: 12
👥 Active users with SMS enabled: 25
```

### Monitoring:

View logs:
```bash
# If using PM2
pm2 logs ecowatch-scheduler

# View alert events in database
SELECT * FROM alert_events ORDER BY created_at DESC LIMIT 10;
```

### Stop the Scheduler:

```bash
# If running in terminal
Ctrl+C

# If using PM2
pm2 stop ecowatch-scheduler
pm2 delete ecowatch-scheduler
```
