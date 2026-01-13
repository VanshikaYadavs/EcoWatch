# 🗺️ Location System - Issues & Solutions

## 🔍 CURRENT SITUATION ANALYSIS

### Problem 1: **No User Location Preferences Stored**
**Issue:** Users don't have their preferred location saved in the database
- `user_alert_preferences` table has NO location columns
- `profiles` table has NO location columns
- Alerts are sent for ALL readings regardless of user's location
- Users in Delhi get alerts for Jaipur readings ❌

### Problem 2: **Location Matching Logic Missing**
**Issue:** Alert system doesn't check if reading location matches user location
```javascript
// Current code in alerts.mjs
for (const p of prefs) {
  // ❌ NO location check!
  if (reading.aqi >= p.aqi_threshold) {
    sendAlert(); // Sends to everyone!
  }
}
```

### Problem 3: **Frontend Doesn't Capture User Location**
**Issue:** No UI to set user's preferred location(s)
- Profile page has location field but it's not saved
- No way for users to select which cities they want to monitor
- No geolocation API integration

---

## 🎯 SOLUTION: Multi-Location Alert System

### Architecture:
1. **Users can monitor multiple locations** (home, office, family)
2. **Alerts sent only for user's selected locations**
3. **Auto-detect current location** (optional)
4. **Distance-based matching** (alert if within X km)

---

## 📋 IMPLEMENTATION PLAN

### Step 1: Database Schema Changes ✅

**Add user_locations table:**
```sql
CREATE TABLE user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  alert_radius_km INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, location_name)
);

CREATE INDEX idx_user_locations_user ON user_locations(user_id);
```

**Alternative: Simple approach with user_alert_preferences:**
```sql
ALTER TABLE user_alert_preferences 
ADD COLUMN monitored_locations TEXT[]; -- Array of location names
-- Example: ['Jaipur', 'Delhi', 'Udaipur']

-- Or for coordinates-based matching:
ALTER TABLE user_alert_preferences 
ADD COLUMN primary_latitude DOUBLE PRECISION,
ADD COLUMN primary_longitude DOUBLE PRECISION,
ADD COLUMN alert_radius_km INTEGER DEFAULT 10;
```

### Step 2: Update Alert Logic ✅

**Match reading location with user locations:**
```javascript
// In alerts.mjs - evaluateAndRecordAlerts()

for (const p of prefs) {
  // NEW: Check if user monitors this location
  if (!userMonitorsLocation(p, reading.location, reading.latitude, reading.longitude)) {
    continue; // Skip this user
  }
  
  // Then check thresholds...
  if (reading.aqi >= p.aqi_threshold) {
    sendAlert();
  }
}

function userMonitorsLocation(pref, locationName, lat, lon) {
  // Option 1: Name-based matching
  if (pref.monitored_locations?.includes(locationName)) {
    return true;
  }
  
  // Option 2: Distance-based matching
  if (pref.primary_latitude && pref.primary_longitude) {
    const distance = calculateDistance(
      pref.primary_latitude, pref.primary_longitude,
      lat, lon
    );
    return distance <= (pref.alert_radius_km || 10);
  }
  
  return false;
}
```

### Step 3: Frontend Location Selection ✅

**Add to Notification Settings page:**
```jsx
<section>
  <h3>📍 Monitored Locations</h3>
  <p>Select cities you want to receive alerts for:</p>
  
  <div className="location-selector">
    <Checkbox value="Jaipur">Jaipur</Checkbox>
    <Checkbox value="Delhi">Delhi</Checkbox>
    <Checkbox value="Udaipur">Udaipur</Checkbox>
    <Checkbox value="Jodhpur">Jodhpur</Checkbox>
    {/* ... more cities */}
  </div>
  
  <Button onClick={detectCurrentLocation}>
    📍 Use My Current Location
  </Button>
</section>
```

**Geolocation API integration:**
```javascript
async function detectCurrentLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation not supported');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get city name
      const cityName = await getCityName(latitude, longitude);
      
      // Save to user preferences
      await updateUserLocations([cityName]);
    },
    (error) => {
      console.error('Location error:', error);
    }
  );
}
```

### Step 4: Backend API Enhancements ✅

**New endpoint: GET /api/user/locations**
```javascript
app.get('/api/user/locations', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('user_alert_preferences')
    .select('monitored_locations, primary_latitude, primary_longitude')
    .eq('user_id', req.user_id)
    .single();
  
  res.json({ data });
});
```

**New endpoint: PUT /api/user/locations**
```javascript
app.put('/api/user/locations', requireAuth, async (req, res) => {
  const { locations, latitude, longitude, radius_km } = req.body;
  
  const { error } = await supabaseAdmin
    .from('user_alert_preferences')
    .update({
      monitored_locations: locations,
      primary_latitude: latitude,
      primary_longitude: longitude,
      alert_radius_km: radius_km
    })
    .eq('user_id', req.user_id);
  
  res.json({ success: !error });
});
```

---

## 🚀 QUICK FIX (Minimal Changes)

For immediate functionality with minimal code changes:

### 1. Add location array to user_alert_preferences:
```sql
ALTER TABLE user_alert_preferences 
ADD COLUMN monitored_locations TEXT[];

-- Set default to monitor all cities (temporary)
UPDATE user_alert_preferences 
SET monitored_locations = ARRAY['Jaipur', 'Delhi', 'Udaipur', 'Jodhpur'];
```

### 2. Update alerts.mjs (ONE line change):
```javascript
// Before threshold checks, add:
if (p.monitored_locations && !p.monitored_locations.includes(reading.location)) {
  continue;
}
```

### 3. Update notification settings UI:
- Add multi-select dropdown for cities
- Save to `monitored_locations` array

---

## 🔧 DEBUGGING CURRENT ISSUES

### Issue: "Wrong location in alert emails"

**Check these:**
```sql
-- 1. What locations are in environment_readings?
SELECT DISTINCT location FROM environment_readings 
ORDER BY location;

-- 2. What location names does the API resolve?
-- Look at backend logs for: [ingest] finalName="..."

-- 3. Location name inconsistencies?
SELECT location, COUNT(*) 
FROM environment_readings 
GROUP BY location;
```

**Common problems:**
- "Jaipur Municipal Corporation" vs "Jaipur" 
- "Police Commissionerate" vs "Jaipur"
- API returning different names for same coordinates

**Fix:** Normalize location names in ingest.mjs:
```javascript
function normalizeLocationName(name) {
  const mapping = {
    'Jaipur Municipal Corporation': 'Jaipur',
    'Police Commissionerate': 'Jaipur',
    'Jaipur City': 'Jaipur',
    // ... add more mappings
  };
  return mapping[name] || name;
}
```

---

## 📊 TESTING PLAN

1. **Database Setup:**
   - Run location schema migration
   - Add sample user locations

2. **Alert Logic Test:**
   - User A monitors: Jaipur
   - User B monitors: Delhi
   - Trigger Jaipur reading with high AQI
   - ✅ User A gets alert
   - ❌ User B should NOT get alert

3. **Distance-based Test:**
   - User location: (26.9124, 75.7873) - Jaipur center
   - Reading location: (26.8, 75.8) - ~15km away
   - Alert radius: 10km
   - ❌ Should NOT alert (outside radius)

4. **Frontend Test:**
   - Select multiple locations
   - Save preferences
   - Verify saved in database
   - Trigger alerts for each location

---

## 📝 RECOMMENDED APPROACH

**Phase 1: Quick Fix (Today)**
✅ Add `monitored_locations` TEXT[] column
✅ Update alerts.mjs with location filter
✅ Set default locations for all users

**Phase 2: Full Solution (This Week)**
✅ Add location selection UI
✅ Normalize location names
✅ Add geolocation detection
✅ Distance-based matching

**Phase 3: Advanced Features (Future)**
✅ Multiple saved locations
✅ Location-based notification schedules
✅ Nearest sensor selection
✅ Travel mode (temporary location monitoring)

---

## 🐛 KNOWN BUGS TO FIX

1. **Location name inconsistency** - Same city has multiple names
2. **No location validation** - Users can't select monitored cities
3. **Global alerts** - Everyone gets all alerts regardless of location
4. **No distance calculation** - Can't match nearby readings

---

Would you like me to start implementing the Quick Fix first?
