# 🚀 Quick Start: Testing Location-Based Alerts

## Step 1: Run Database Migration (REQUIRED)

Open Supabase SQL Editor and run:

```
c:\Users\amish\OneDrive\Desktop\EcoWatch\database\migrations\2026-01-13-add-location-support.sql
```

**What this does:**
- Adds `monitored_locations` column to user_alert_preferences
- Creates location_name_mappings table with 10 Rajasthan cities
- Sets up normalization function

## Step 2: Verify Migration

Run verification queries:

```
c:\Users\amish\OneDrive\Desktop\EcoWatch\database\verify-location-setup.sql
```

**Expected results:**
- 3 new columns should appear
- 10 cities in location_name_mappings
- normalize_location_name function working

## Step 3: Restart Backend

```powershell
cd C:\Users\amish\OneDrive\Desktop\EcoWatch\backend

# Kill old process if running
$processId = (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess
if ($processId) { Stop-Process -Id $processId -Force }

# Start fresh
npm start
```

## Step 4: Test Backend Endpoints

```powershell
# Test available locations
Invoke-WebRequest -Uri "http://localhost:8080/api/locations" -UseBasicParsing

# Test nearby locations (Jaipur coordinates)
Invoke-WebRequest -Uri "http://localhost:8080/api/locations/nearby?lat=26.9124&lon=75.7873&radius_km=50" -UseBasicParsing

# Test normalization
Invoke-WebRequest -Uri "http://localhost:8080/api/locations/normalize" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"location_name":"Jaipur Municipal Corporation"}' `
  -UseBasicParsing
```

## Step 5: Run Automated Tests

```powershell
cd C:\Users\amish\OneDrive\Desktop\EcoWatch\backend
node test-location-filtering.mjs
```

**What this tests:**
1. Sets up test user with monitored locations: [Jaipur, Delhi]
2. Ingests readings from 4 cities
3. Verifies alerts only sent for Jaipur and Delhi
4. Shows alert summary

**Expected output:**
```
✅ Alert created for Jaipur (monitored)
✅ Alert created for Delhi (monitored)
ℹ️  No alert for Udaipur (not monitored)
ℹ️  No alert for Jodhpur (not monitored)
```

## Step 6: Test Frontend UI

```powershell
cd C:\Users\amish\OneDrive\Desktop\EcoWatch\frontend
npm run dev
```

1. Open http://localhost:5173
2. Login to your account
3. Go to **Notification Settings**
4. Click **"Monitored Locations"** tab
5. Try these features:
   - ✅ Select/deselect locations manually
   - ✅ Click "Detect My Location" to auto-find nearby
   - ✅ Adjust search radius
   - ✅ Save preferences

## Step 7: Test Real Alerts

1. In Notification Settings → Monitored Locations:
   - Select **Jaipur** only
   - Save preferences

2. In Notification Settings → Alert Thresholds:
   - Set AQI threshold to **50** (low to ensure alerts)
   - Save settings

3. Make sure Notification Channels → Email is enabled

4. Trigger ingestion:
```powershell
# This should send alert (Jaipur is monitored)
Invoke-WebRequest -Uri "http://localhost:8080/api/ingest/now?name=Jaipur&lat=26.91&lon=75.78&demo=1" -UseBasicParsing

# This should NOT send alert (Delhi not monitored)
Invoke-WebRequest -Uri "http://localhost:8080/api/ingest/now?name=Delhi&lat=28.61&lon=77.21&demo=1" -UseBasicParsing
```

5. Check your email - you should receive alert for Jaipur only!

## 🐛 Troubleshooting

### No alerts received?

1. **Check email alerts enabled:**
```sql
SELECT user_id, email_alerts, monitored_locations, aqi_threshold 
FROM user_alert_preferences 
WHERE user_id = 'YOUR_USER_ID';
```

2. **Check profile has email:**
```sql
SELECT id, email FROM profiles WHERE id = 'YOUR_USER_ID';
```

3. **Check backend logs:**
Look for lines like:
```
[alerts] Evaluating reading for Jaipur
[alerts] Found 1 users with alerts enabled
[email] ✅ Email sent to: your@email.com
```

### Backend not starting?

1. Kill process on port 8080:
```powershell
$processId = (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess
if ($processId) { Stop-Process -Id $processId -Force }
```

2. Check .env file has required variables:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SENDGRID_API_KEY=...
```

### Location not normalizing?

Run in Supabase:
```sql
SELECT normalize_location_name('Jaipur Municipal Corporation');
-- Should return: "Jaipur"
```

If function doesn't exist, re-run migration.

### Geolocation not working in browser?

- Must use HTTPS (or localhost)
- Check browser permissions
- Try Chrome/Firefox (some browsers block by default)

## ✅ Success Criteria

You've successfully set up the location system if:

✅ Database migration completed without errors
✅ Backend starts and shows location endpoints in logs
✅ Test script shows alerts for monitored locations only
✅ Frontend shows "Monitored Locations" tab
✅ You can select locations and save preferences
✅ Alerts are sent only for your monitored locations
✅ Location names are normalized (e.g., "Jaipur Municipal Corporation" → "Jaipur")

## 📚 Next Steps

1. **Set default locations for existing users:**
```sql
UPDATE user_alert_preferences 
SET monitored_locations = ARRAY['Jaipur'] 
WHERE monitored_locations IS NULL OR array_length(monitored_locations, 1) = 0;
```

2. **Add more cities:**
```sql
INSERT INTO location_name_mappings (canonical_name, alternate_names, latitude, longitude, state)
VALUES ('Mumbai', ARRAY['Mumbai', 'Bombay'], 19.0760, 72.8777, 'Maharashtra');
```

3. **Monitor alert delivery:**
```sql
SELECT 
  location,
  COUNT(*) as alert_count,
  COUNT(DISTINCT user_id) as unique_users
FROM alert_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY location
ORDER BY alert_count DESC;
```

## 🎉 You're Done!

Your location-based alert system is now fully operational. Users will only receive alerts for the locations they care about!

For detailed documentation, see:
- **LOCATION_SYSTEM_COMPLETE.md** - Full technical documentation
- **LOCATION_SYSTEM_ANALYSIS.md** - Original problem analysis
