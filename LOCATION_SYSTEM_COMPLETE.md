# Location-Based Alert System - Complete Implementation

## 🎯 Overview

The location-based alert system ensures users only receive alerts for environmental readings from locations they explicitly choose to monitor. This prevents irrelevant alerts and improves the user experience significantly.

## ✅ What Was Implemented

### 1. Database Schema (Migration)
**File:** `database/migrations/2026-01-13-add-location-support.sql`

Added:
- `monitored_locations` column (TEXT[]) - Array of location names user wants to monitor
- `alert_radius_km` column (INTEGER) - Radius for location-based alerts when using geolocation
- `auto_detect_location` column (BOOLEAN) - Whether to auto-detect user location
- `location_name_mappings` table - Normalizes location names from various sources
- `normalize_location_name()` function - Database function to convert alternate names to canonical names
- Pre-populated 10 Rajasthan cities with alternate names

### 2. Backend API Endpoints
**File:** `backend/src/index.mjs`

New endpoints:
- `GET /api/user/locations` - Get user's monitored locations
- `PUT /api/user/locations` - Update user's monitored locations
- `GET /api/locations` - Get list of all available locations
- `POST /api/locations/normalize` - Normalize a location name
- `GET /api/locations/nearby?lat=X&lon=Y&radius_km=Z` - Find nearby locations

### 3. Alert Filtering Logic
**File:** `backend/src/alerts.mjs`

Updated `evaluateAndRecordAlerts()` to:
- Check if user has `monitored_locations` set
- Skip alerts if reading location is not in user's monitored list
- Use case-insensitive partial matching to handle location name variations
- Log when users are filtered out due to location mismatch

### 4. Location Name Normalization
**File:** `backend/src/ingest.mjs`

Added:
- `normalizeLocationName()` function - Normalizes location names before storing
- Integration with database normalization function
- Automatic normalization during ingestion process
- Logging when location names are normalized

### 5. Frontend Location Service
**File:** `frontend/src/services/location.service.js`

Comprehensive service with:
- `getUserLocations()` - Fetch user's location preferences
- `updateUserLocations()` - Save location preferences
- `getAvailableLocations()` - Get all available locations
- `normalizeLocationName()` - Normalize location name
- `getNearbyLocations()` - Find locations near coordinates
- `getCurrentPosition()` - Get user's device location
- `autoDetectAndFindLocations()` - Auto-detect and find nearby locations
- `watchPosition()` / `clearWatch()` - Track user location continuously
- `calculateDistance()` - Calculate distance between coordinates

### 6. Frontend Location Selection UI
**File:** `frontend/src/pages/notification-setting/components/LocationConfiguration.jsx`

Features:
- View all available monitoring locations
- Select/deselect multiple locations
- Auto-detect nearby locations using device GPS
- Adjust search radius (25km, 50km, 100km, 200km)
- Visual indicators for selected locations
- Distance display for nearby locations
- Save/reset functionality
- Error handling and success messages

**File:** `frontend/src/pages/notification-setting/index.jsx`

Integration:
- Added "Monitored Locations" tab to notification settings
- Updated tab grid to support 5 tabs
- Integrated LocationConfiguration component

## 📋 Setup Instructions

### Step 1: Run Database Migration

```sql
-- In Supabase SQL Editor, run:
-- c:\Users\amish\OneDrive\Desktop\EcoWatch\database\migrations\2026-01-13-add-location-support.sql
```

This will:
- Add new columns to `user_alert_preferences`
- Create `location_name_mappings` table
- Insert 10 Rajasthan cities with alternate names
- Create normalization function

### Step 2: Verify Migration

```sql
-- Run verification queries:
-- c:\Users\amish\OneDrive\Desktop\EcoWatch\database\verify-location-setup.sql
```

Expected output:
- 3 new columns in user_alert_preferences
- location_name_mappings table with 10 cities
- normalize_location_name function working

### Step 3: Restart Backend

```powershell
cd backend
npm start
```

The backend will automatically pick up the new columns and endpoints.

### Step 4: Test Backend Endpoints

```bash
# Get available locations (no auth required)
curl http://localhost:8080/api/locations

# Get nearby locations
curl "http://localhost:8080/api/locations/nearby?lat=26.9124&lon=75.7873&radius_km=50"

# Normalize location name
curl -X POST http://localhost:8080/api/locations/normalize \
  -H "Content-Type: application/json" \
  -d '{"location_name": "Jaipur Municipal Corporation"}'
```

### Step 5: Test Location Filtering

```bash
cd backend
node test-location-filtering.mjs
```

This will:
1. Set up a test user with monitored locations: Jaipur, Delhi
2. Ingest readings from 4 locations: Jaipur, Delhi, Udaipur, Jodhpur
3. Verify alerts are only sent for Jaipur and Delhi
4. Show alert events summary

Expected result:
- ✅ Alerts created for Jaipur and Delhi
- ❌ No alerts for Udaipur and Jodhpur
- Email sent only for monitored locations

### Step 6: Test Frontend UI

1. Start frontend: `cd frontend && npm run dev`
2. Login to the app
3. Go to Notification Settings
4. Click on "Monitored Locations" tab
5. Try features:
   - Select/deselect locations manually
   - Click "Detect My Location" to auto-find nearby locations
   - Adjust search radius
   - Save preferences

## 🔄 How It Works

### Alert Flow with Location Filtering

```
1. Environmental Reading Ingested
   ↓
2. Location Name Normalized (e.g., "Jaipur Municipal Corporation" → "Jaipur")
   ↓
3. Reading Stored in Database
   ↓
4. Alert Evaluation Started
   ↓
5. Fetch Users with Alerts Enabled
   ↓
6. For Each User:
   ├─ Check monitored_locations array
   ├─ If empty → Send alerts (backward compatible)
   ├─ If set → Check if reading location matches
   ├─ If match → Continue to threshold checks
   └─ If no match → Skip this user (no alert)
   ↓
7. Threshold Checks (AQI, Noise, Temperature, Humidity)
   ↓
8. Send Alerts (Email/SMS) only to matching users
```

### Location Name Normalization

The system handles location name variations automatically:

```javascript
Input: "Jaipur Municipal Corporation"
Output: "Jaipur"

Input: "Police Commissionerate"
Output: "Jaipur"

Input: "Pink City"
Output: "Jaipur"
```

This ensures consistent matching even when data sources use different names.

### Auto-Detection Flow

```
1. User clicks "Detect My Location"
   ↓
2. Browser requests GPS permission
   ↓
3. Get user's coordinates (latitude, longitude)
   ↓
4. Send to backend: /api/locations/nearby
   ↓
5. Calculate distances to all known locations
   ↓
6. Return locations within radius
   ↓
7. Auto-select nearby locations
   ↓
8. User can review and save
```

## 🧪 Testing Scenarios

### Scenario 1: User Monitors Single Location

```javascript
// User monitors only Jaipur
monitored_locations: ['Jaipur']

// Test ingestions:
ingest({name: 'Jaipur', ...})  // ✅ Alert sent
ingest({name: 'Delhi', ...})   // ❌ No alert
ingest({name: 'Udaipur', ...}) // ❌ No alert
```

### Scenario 2: User Monitors Multiple Locations

```javascript
// User monitors Jaipur and Delhi
monitored_locations: ['Jaipur', 'Delhi']

// Test ingestions:
ingest({name: 'Jaipur', ...})  // ✅ Alert sent
ingest({name: 'Delhi', ...})   // ✅ Alert sent
ingest({name: 'Udaipur', ...}) // ❌ No alert
```

### Scenario 3: User Has No Monitored Locations (Backward Compatible)

```javascript
// User hasn't set monitored_locations yet
monitored_locations: [] or null

// Test ingestions:
ingest({name: 'Jaipur', ...})  // ✅ Alert sent (all locations)
ingest({name: 'Delhi', ...})   // ✅ Alert sent (all locations)
ingest({name: 'Udaipur', ...}) // ✅ Alert sent (all locations)
```

### Scenario 4: Location Name Variations

```javascript
// User monitors "Jaipur"
monitored_locations: ['Jaipur']

// Test ingestions with different names:
ingest({name: 'Jaipur', ...})                      // ✅ Exact match
ingest({name: 'Jaipur Municipal Corporation', ...}) // ✅ Partial match
ingest({name: 'Police Commissionerate', ...})      // ✅ Normalized to Jaipur
```

## 📊 Database Schema Reference

### user_alert_preferences (Updated)

```sql
CREATE TABLE user_alert_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  
  -- Existing columns
  email_alerts BOOLEAN DEFAULT true,
  sms_alerts BOOLEAN DEFAULT false,
  aqi_threshold INTEGER,
  noise_threshold INTEGER,
  temp_threshold INTEGER,
  humidity_threshold INTEGER,
  
  -- NEW: Location preferences
  monitored_locations TEXT[] DEFAULT ARRAY[]::TEXT[],
  alert_radius_km INTEGER DEFAULT 50,
  auto_detect_location BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### location_name_mappings (New)

```sql
CREATE TABLE location_name_mappings (
  id SERIAL PRIMARY KEY,
  canonical_name TEXT NOT NULL UNIQUE,
  alternate_names TEXT[] NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  state TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 Frontend Components

### LocationConfiguration Component

Props: None (fetches data internally)

State:
- `locations` - All available locations from backend
- `selectedLocations` - User's currently selected locations
- `alertRadius` - Search radius for nearby locations
- `userPosition` - User's GPS coordinates (when detected)
- `nearbyLocs` - Locations near user's position

Key Methods:
- `loadData()` - Fetch available locations and user preferences
- `handleSave()` - Save user's location preferences
- `handleLocationToggle(locationName)` - Select/deselect location
- `handleAutoDetect()` - Detect user location and find nearby places

## 🔧 Configuration

### Environment Variables

No new environment variables required. Uses existing:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEFAULT_USER_ID` (for testing)

### Frontend Environment

Uses existing:
- `VITE_API_BASE_URL` (defaults to http://localhost:8080)

## 🐛 Troubleshooting

### Issue: Location normalization not working

**Solution:**
```sql
-- Verify function exists
SELECT proname FROM pg_proc WHERE proname = 'normalize_location_name';

-- Test function
SELECT normalize_location_name('Jaipur Municipal Corporation');
```

### Issue: Alerts still sent to all users

**Solution:**
1. Check user preferences have monitored_locations set:
```sql
SELECT user_id, monitored_locations FROM user_alert_preferences;
```

2. Verify alert filtering logic is in place:
```javascript
// In backend/src/alerts.mjs, should see:
if (p.monitored_locations && Array.isArray(p.monitored_locations) && p.monitored_locations.length > 0) {
  // Location filtering logic
}
```

3. Restart backend to pick up code changes

### Issue: Frontend location service not working

**Solution:**
1. Check browser console for errors
2. Verify API base URL is correct
3. Check user is authenticated (need token for user-specific endpoints)
4. Test endpoints directly:
```bash
curl http://localhost:8080/api/locations
```

### Issue: Geolocation not working in browser

**Solution:**
1. Ensure HTTPS (geolocation requires secure context)
2. Check browser permissions for location access
3. Try different browser (some block by default)
4. Check browser console for permission denied errors

## 📈 Performance Considerations

### Database Queries

- Location filtering happens in memory (not in SQL query)
- Can be optimized with array contains operator if needed:
```sql
WHERE reading.location = ANY(user_prefs.monitored_locations)
```

### Frontend Caching

Location service doesn't cache by default. Consider adding:
```javascript
let cachedLocations = null;
export async function getAvailableLocations() {
  if (cachedLocations) return cachedLocations;
  // ... fetch logic
  cachedLocations = result;
  return result;
}
```

## 🚀 Future Enhancements

### Planned Features

1. **Distance-Based Alerts**
   - Use alert_radius_km for automatic location matching
   - Send alerts for locations within X km of user

2. **Multiple Alert Profiles**
   - Home locations
   - Work locations
   - Travel locations

3. **Smart Location Suggestions**
   - Suggest locations based on user's past activity
   - Recommend locations frequently visited by similar users

4. **Location Groups**
   - Create custom groups (e.g., "My Family's Cities")
   - Share location groups with other users

5. **Historical Location Tracking**
   - Track where user was when alert was sent
   - Show alerts on a map

## 📝 API Documentation

### GET /api/user/locations

Get authenticated user's location preferences.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "monitored_locations": ["Jaipur", "Delhi"],
  "alert_radius_km": 50,
  "auto_detect_location": false
}
```

### PUT /api/user/locations

Update user's location preferences.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "monitored_locations": ["Jaipur", "Delhi", "Udaipur"],
  "alert_radius_km": 100,
  "auto_detect_location": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monitored_locations": ["Jaipur", "Delhi", "Udaipur"],
    "alert_radius_km": 100,
    "auto_detect_location": true
  }
}
```

### GET /api/locations

Get all available monitoring locations.

**Response:**
```json
{
  "locations": [
    {
      "canonical_name": "Jaipur",
      "latitude": 26.9124,
      "longitude": 75.7873,
      "state": "Rajasthan"
    },
    ...
  ]
}
```

### GET /api/locations/nearby

Find locations near coordinates.

**Query Parameters:**
- `lat` (required) - Latitude
- `lon` (required) - Longitude
- `radius_km` (optional) - Search radius in km (default: 50)

**Response:**
```json
{
  "user_location": {
    "latitude": 26.9124,
    "longitude": 75.7873
  },
  "radius_km": 50,
  "nearby_locations": [
    {
      "canonical_name": "Jaipur",
      "latitude": 26.9124,
      "longitude": 75.7873,
      "state": "Rajasthan",
      "distance_km": 0.5
    },
    ...
  ]
}
```

### POST /api/locations/normalize

Normalize a location name to canonical form.

**Body:**
```json
{
  "location_name": "Jaipur Municipal Corporation"
}
```

**Response:**
```json
{
  "normalized_name": "Jaipur"
}
```

## ✅ Checklist

Before going to production:

- [ ] Run database migration in Supabase
- [ ] Verify migration with verify-location-setup.sql
- [ ] Run backend test: `node test-location-filtering.mjs`
- [ ] Test frontend location UI
- [ ] Test geolocation in different browsers
- [ ] Set monitored_locations for all existing users (or leave empty for backward compatibility)
- [ ] Update user onboarding to prompt for location selection
- [ ] Add location selection to signup flow
- [ ] Document location system for users (help docs)
- [ ] Monitor alert delivery rates after deployment
- [ ] Set up analytics for location feature usage

## 🎉 Conclusion

The location-based alert system is now fully implemented with:
- ✅ Database schema with normalization
- ✅ Backend API endpoints
- ✅ Alert filtering logic
- ✅ Location name normalization
- ✅ Frontend UI with auto-detection
- ✅ Comprehensive testing tools
- ✅ Complete documentation

Users can now:
1. Select which locations they want to monitor
2. Auto-detect nearby locations using GPS
3. Receive alerts ONLY for their monitored locations
4. Manage preferences through beautiful UI

The system handles location name variations automatically and is backward compatible with users who haven't set preferences yet.
