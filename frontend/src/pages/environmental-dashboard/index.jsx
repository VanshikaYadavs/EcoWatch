import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from './components/MetricCard';
import SensorMap from './components/SensorMap';
import FilterControls from './components/FilterControls';
import HotspotAlert from './components/HotspotAlert';
import QuickStats from './components/QuickStats';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useEnvironmentReadings, useAlertEvents, useLatestCityReadings } from '../../utils/dataHooks';
import { getLatestReading } from '../../services/environment.service';
import { getDashboardStats, getMapSensors, checkBackendStatus } from '../../utils/environmentService';
import { getCurrentLocation, getLocationName } from '../../utils/location';
import { getNearbyCities } from '../../utils/nearbyCities';
import { getSessionAllowlist, recomputeSessionCities } from '../../utils/sessionCities';
import axios from 'axios';
import { supabase } from '../../utils/supabaseClient';

const EnvironmentalDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('realtime');
  const [location, setLocation] = useState('all');
  const [parameter, setParameter] = useState('all');
  const [envData, setEnvData] = useState(null);
  const [envLoading, setEnvLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const { data: readings } = useEnvironmentReadings({ location: location === 'all' ? null : location, limit: 100, realtime: true });
  const { data: alerts } = useAlertEvents({ limit: 20 });
  const [allowlist, setAllowlist] = useState([]);
  const [recomputing, setRecomputing] = useState(false);
  const { data: latestCityReadings } = useLatestCityReadings({ fallbackWindow: 120, allowLocations: allowlist });
  
  // GPS Location State
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [userLocationData, setUserLocationData] = useState(null);

  // Backend data state
  const [backendStats, setBackendStats] = useState(null);
  const [backendSensors, setBackendSensors] = useState([]);
  const [backendStatus, setBackendStatus] = useState({ status: 'checking', message: 'Checking...' });

  const latest = useMemo(() => readings?.[0] || {}, [readings]);

  // Fetch backend stats and sensors with REAL-TIME updates
  useEffect(() => {
    let mounted = true;
    let consecutiveErrors = 0;
    const maxErrors = 3;
    
    const fetchBackendData = async () => {
      try {
        const startTime = Date.now();
        const [stats, sensorsData, status] = await Promise.all([
          getDashboardStats(),
          getMapSensors(),
          checkBackendStatus(),
        ]);
        const fetchTime = Date.now() - startTime;

        if (!mounted) return;
        
        // Log performance
        if (fetchTime > 2000) {
          console.warn(`⚠️ Backend fetch took ${(fetchTime/1000).toFixed(1)}s - connection may be slow`);
        } else {
          console.log(`✅ Backend data refreshed in ${fetchTime}ms`);
        }

        if (stats) {
          // Validate data freshness
          const dataAge = stats.timestamp ? (Date.now() - new Date(stats.timestamp).getTime()) / 1000 : 0;
          if (dataAge > 60) {
            console.warn(`⚠️ Backend stats are ${Math.round(dataAge)}s old`);
          }
          setBackendStats(stats);
        }
        
        if (sensorsData) {
          // Validate sensor data quality
          const validSensors = sensorsData.sensors?.filter(s => 
            s.lat !== 0 && s.lng !== 0 && s.location && s.location !== 'Unknown'
          ) || [];
          
          if (validSensors.length < sensorsData.sensors?.length) {
            console.warn(`⚠️ Filtered out ${sensorsData.sensors.length - validSensors.length} invalid sensors`);
          }
          
          setBackendSensors(validSensors);
        }
        
        if (status) setBackendStatus(status);
        
        consecutiveErrors = 0; // Reset error count on success
      } catch (error) {
        console.error('❌ Error fetching backend data:', error);
        consecutiveErrors++;
        
        if (mounted) {
          setBackendStatus({ 
            status: 'error', 
            message: `Backend unavailable (${consecutiveErrors}/${maxErrors} errors)` 
          });
          
          // If too many errors, increase polling interval
          if (consecutiveErrors >= maxErrors) {
            console.error('🚨 Multiple backend errors detected. Backend may be down.');
          }
        }
      }
    };

    // Initial fetch
    fetchBackendData();
    
    // REAL-TIME: Refresh backend data every 15 seconds for accurate monitoring
    const interval = setInterval(fetchBackendData, 15000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setEnvLoading(true);
      const currentCity = allowlist?.length ? allowlist[0] : null;
      try {
        const data = await getLatestReading(currentCity);
        if (!cancelled) {
          setEnvData(data || null);
          setLastFetchTime(new Date()); // Set real-time fetch timestamp
        }
      } catch (e) {
        if (!cancelled) {
          console.warn('Latest reading fetch failed:', e?.message || e);
        }
      } finally {
        if (!cancelled) setEnvLoading(false);
      }
    };
    
    fetchData(); // Initial fetch
    
    // Auto-refresh every 30 seconds for real-time updates
    const refreshInterval = setInterval(fetchData, 30000);
    
    return () => { 
      cancelled = true; 
      clearInterval(refreshInterval);
    };
  }, [allowlist?.[0]]);

  // When the session allowlist loads, default the page's selected location
  // to the current city to avoid global reads.
  useEffect(() => {
    if (allowlist?.length && location === 'all') {
      setLocation(allowlist[0]);
    }
  }, [allowlist, location]);

  // On first load, load session allowlist (don't auto-ingest GPS location)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const names = await getSessionAllowlist();
        if (mounted) setAllowlist(names);
      } catch {}
      
      // Note: Removed automatic GPS-based ingestion
      // Users should select monitored locations in Notification Settings → Monitored Locations
      // Only data for monitored locations will trigger alerts
      // This prevents random location ingestion on every page load
      
      console.log('[dashboard] Loaded session allowlist:', names);
      console.log('[dashboard] To select monitored locations, go to: Notification Settings → Monitored Locations');
    })();
    return () => { mounted = false; };
  }, []);
  
  // Function to detect and fetch user's GPS location data with high accuracy
  const fetchUserLocationData = async (useHighAccuracy = true, retryCount = 0) => {
    setLocationLoading(true);
    if (retryCount === 0) {
      setLocationError(null);
    }
    
    try {
      // Get GPS coordinates with high accuracy settings
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by your browser'));
          return;
        }
        
        // Use watchPosition for better accuracy
        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            navigator.geolocation.clearWatch(watchId);
            resolve(pos);
          },
          reject,
          {
            enableHighAccuracy: true, // Always use high accuracy
            timeout: 20000, // 20 seconds timeout for better GPS lock
            maximumAge: 0 // Always get fresh location, no cache
          }
        );
      });
      
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const accuracy = position.coords.accuracy; // meters
      const altitude = position.coords.altitude;
      const heading = position.coords.heading;
      const speed = position.coords.speed;
      
      console.log(`📍 GPS acquired: (${lat.toFixed(6)}, ${lon.toFixed(6)}) ±${accuracy.toFixed(0)}m`);
      console.log(`📊 GPS Details: altitude=${altitude}m, heading=${heading}°, speed=${speed}m/s`);
      
      // Get actual location name from GPS coordinates (reverse geocoding)
      console.log('🔍 Fetching actual location name from GPS coordinates...');
      const actualLocationName = await getLocationName(lat, lon);
      console.log(`📍 Actual GPS location: "${actualLocationName}"`);
      
      // Retry if accuracy is very poor (only on first attempt)
      if (accuracy > 500 && retryCount < 2) {
        console.warn(`⚠️ GPS accuracy too low: ±${accuracy.toFixed(0)}m. Retrying... (attempt ${retryCount + 1}/2)`);
        setLocationLoading(false);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return fetchUserLocationData(true, retryCount + 1);
      }
      
      // Warn if accuracy is poor
      if (accuracy > 100) {
        console.warn(`⚠️ GPS accuracy is low: ±${accuracy.toFixed(0)}m. Consider moving to open area.`);
      } else if (accuracy < 20) {
        console.log(`✅ Excellent GPS accuracy: ±${accuracy.toFixed(0)}m`);
      }
      
      // Get session and user info
      const { data: sessData } = await supabase.auth.getSession();
      const userId = sessData?.session?.user?.id;
      const token = sessData?.session?.access_token;
      
      if (!userId || !token) {
        throw new Error('Please login to fetch environmental data');
      }
      
      // Trigger backend to fetch REAL-TIME environmental data for this exact location
      const response = await axios.get(
        `http://localhost:8080/api/ingest/now?lat=${lat}&lon=${lon}&name=${encodeURIComponent(actualLocationName || 'Your Location')}&accuracy=${accuracy}&timestamp=${Date.now()}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 20000 // 20 second timeout for API call
        }
      );
      
      const data = response.data?.data;
      const currentTime = new Date().toISOString();
      
      // Validate data freshness (should be within last 5 minutes)
      const dataAge = data?.recorded_at ? (Date.now() - new Date(data.recorded_at).getTime()) / 1000 : 0;
      if (dataAge > 300) {
        console.warn(`⚠️ Data is ${Math.round(dataAge / 60)} minutes old`);
      }
      
      // Use the ACTUAL location name from GPS (not backend's normalized version)
      const displayLocationName = actualLocationName || data?.location || 'Your Location';
      
      console.log(`📍 Displaying location: "${displayLocationName}"`);
      
      // Update state with fresh data and current timestamp
      setUserLocation({
        lat: lat.toFixed(6), // 6 decimal places = ~11cm accuracy
        lon: lon.toFixed(6),
        accuracy: accuracy.toFixed(0),
        name: displayLocationName
      });
      
      setUserLocationData({
        aqi: data?.aqi,
        temperature: data?.temperature,
        humidity: data?.humidity,
        noise_level: data?.noise_level,
        recorded_at: currentTime,
        location: displayLocationName,
        dataAge: dataAge,
        source: data?.source || 'API'
      });
      
      // Also update the main envData to show GPS data in all metrics
      setEnvData({
        aqi: data?.aqi,
        temperature: data?.temperature,
        humidity: data?.humidity,
        noise_level: data?.noise_level,
        location: displayLocationName,
        recorded_at: currentTime
      });
      
      console.log('✅ Real-time GPS location data fetched:', {
        location: data?.location,
        coords: `(${lat.toFixed(6)}, ${lon.toFixed(6)})`,
        accuracy: `±${accuracy.toFixed(0)}m`,
        dataAge: `${dataAge.toFixed(1)}s`,
        aqi: data?.aqi,
        temperature: data?.temperature,
        humidity: data?.humidity
      });
      
    } catch (error) {
      console.error('❌ Failed to fetch GPS location data:', error);
      let errorMessage = 'Failed to get location';
      
      if (error.code === 1) {
        errorMessage = 'Location permission denied. Please allow location access.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Check GPS/network connection.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setLocationError(errorMessage);
    } finally {
      setLocationLoading(false);
    }
  };
  
  const avg = useMemo(() => {
    if (!readings?.length) return {};
    const sum = readings.reduce((acc, r) => ({
      aqi: acc.aqi + (Number(r.aqi) || 0),
      noise: acc.noise + (Number(r.noise_level) || 0),
      temp: acc.temp + (Number(r.temperature) || 0),
      humidity: acc.humidity + (Number(r.humidity) || 0),
    }), { aqi: 0, noise: 0, temp: 0, humidity: 0 });
    const n = readings.length;
    return {
      aqi: Math.round(sum.aqi / n),
      noise: Math.round(sum.noise / n),
      temp: Math.round(sum.temp / n),
      humidity: Math.round(sum.humidity / n),
      sensors: n,
    };
  }, [readings]);

  const metrics = [
    {
      title: 'Air Quality Index',
      value: String(userLocationData?.aqi ?? envData?.aqi ?? latest?.aqi ?? backendStats?.averages?.aqi ?? avg.aqi ?? '—'),
      unit: 'AQI',
      status: (userLocationData?.aqi ?? envData?.aqi ?? latest?.aqi ?? backendStats?.averages?.aqi ?? avg.aqi) >= 150 ? 'poor' : 'good',
      trend: 'up',
      trendValue: '',
      icon: 'Wind',
      threshold: '150',
      onClick: () => navigate('/air-quality-monitor')
    },
    {
      title: 'Noise Level',
      value: String(userLocationData?.noise_level ?? envData?.noise_level ?? latest?.noise_level ?? backendStats?.averages?.noise ?? avg.noise ?? '—'),
      unit: 'dB',
      status: (userLocationData?.noise_level ?? envData?.noise_level ?? latest?.noise_level ?? backendStats?.averages?.noise ?? avg.noise) >= 85 ? 'critical' : 'moderate',
      trend: 'down',
      trendValue: '',
      icon: 'Volume2',
      threshold: '85',
      onClick: () => navigate('/noise-level-tracking')
    },
    {
      title: 'Temperature',
      value: String(userLocationData?.temperature ?? envData?.temperature ?? latest?.temperature ?? backendStats?.averages?.temperature ?? avg.temp ?? '—'),
      unit: '°C',
      status: (userLocationData?.temperature ?? envData?.temperature ?? latest?.temperature ?? backendStats?.averages?.temperature ?? avg.temp) >= 35 ? 'poor' : 'good',
      trend: 'up',
      trendValue: '',
      icon: 'Thermometer',
      threshold: '35',
      onClick: () => navigate('/temperature-analytics')
    },
    {
      title: 'Humidity',
      value: String(userLocationData?.humidity ?? envData?.humidity ?? latest?.humidity ?? backendStats?.averages?.humidity ?? avg.humidity ?? '—'),
      unit: '%',
      status: 'good',
      trend: 'down',
      trendValue: '',
      icon: 'Droplets',
      threshold: '80',
      onClick: () => {}
    },
    {
      title: 'Active Hotspots',
      value: String(alerts?.length ?? 0),
      unit: 'events',
      status: alerts?.length ? 'critical' : 'good',
      trend: 'up',
      trendValue: '',
      icon: 'MapPin',
      threshold: '5',
      onClick: () => {}
    },
    {
      title: 'Active Sensors',
      value: String(backendStats?.activeSensors ?? avg?.sensors ?? readings?.length ?? 0),
      unit: 'online',
      status: 'good',
      trend: 'up',
      trendValue: '',
      icon: 'Radio',
      threshold: '50',
      onClick: () => {}
    }
  ];

  const alertsToday = useMemo(() => {
    if (!alerts?.length) return 0;
    const today = new Date();
    const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
    const start = new Date(y, m, d).getTime();
    return alerts.filter(a => a?.created_at && new Date(a.created_at).getTime() >= start).length;
  }, [alerts]);

  // Calculate compliance rate (sensors active in last 5 min / total sensors)
  const complianceRate = useMemo(() => {
    if (!backendStats?.activeSensors || !backendSensors?.length) return null;
    const totalSensors = backendSensors.length;
    const activeSensors = backendStats.activeSensors;
    return Math.round((activeSensors / totalSensors) * 100);
  }, [backendStats, backendSensors]);

  // Calculate avg response time (avg time between readings)
  const avgResponseTime = useMemo(() => {
    if (!readings || readings.length < 2) return null;
    const timestamps = readings.map(r => new Date(r.recorded_at).getTime()).sort((a, b) => b - a);
    let totalGap = 0;
    let gapCount = 0;
    for (let i = 0; i < Math.min(10, timestamps.length - 1); i++) {
      totalGap += timestamps[i] - timestamps[i + 1];
      gapCount++;
    }
    return gapCount > 0 ? Math.round(totalGap / gapCount / 1000) : null; // in seconds
  }, [readings]);

  const quickStats = [
    {
      label: 'Total Alerts Today',
      value: String(backendStats?.alertsToday ?? alertsToday),
      icon: 'Bell',
      change: '',
      changeType: 'neutral'
    },
    {
      label: 'Avg Response Time',
      value: avgResponseTime ? `${avgResponseTime}s` : '—',
      icon: 'Clock',
      change: avgResponseTime && avgResponseTime < 60 ? '↓ Good' : '',
      changeType: avgResponseTime && avgResponseTime < 60 ? 'positive' : 'neutral'
    },
    {
      label: 'Compliance Rate',
      value: complianceRate !== null ? `${complianceRate}%` : '—',
      icon: 'CheckCircle',
      change: complianceRate && complianceRate > 80 ? '↑ High' : complianceRate && complianceRate < 50 ? '↓ Low' : '',
      changeType: complianceRate && complianceRate > 80 ? 'positive' : complianceRate && complianceRate < 50 ? 'negative' : 'neutral'
    },
    {
      label: 'Data Coverage',
      value: backendStats?.readingsCount ? `${backendStats.readingsCount} readings` : '—',
      icon: 'Activity',
      change: '',
      changeType: 'neutral'
    }
  ];

  // Use backend sensors if available, otherwise fallback to latestCityReadings
  const sensors = backendSensors.length > 0 
    ? backendSensors 
    : (latestCityReadings || []).map((r, i) => ({
        id: i + 1,
        location: r.location || 'Unknown',
        address: r.location,
        aqi: r.aqi ?? 0,
        noise: r.noise_level ?? 0,
        status: (r.aqi ?? 0) >= 150 ? 'poor' : 'good',
        lat: r.latitude ?? 0,
        lng: r.longitude ?? 0,
      }));

  const hotspots = (alerts || []).map((a, idx) => ({
    id: idx + 1,
    severity: a.type === 'AQI' ? 'critical' : a.type === 'NOISE' ? 'high' : 'medium',
    title: a.message || `${a.type} alert` ,
    location: `${a.location || 'Unknown'}`,
    description: a.message || '',
    aqi: a.type === 'AQI' ? a.value : null,
    noise: a.type === 'NOISE' ? a.value : null,
    temperature: a.type === 'HEAT' ? a.value : null,
    time: new Date(a.created_at).toLocaleString(),
  }));

  const handleRefreshData = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  const handleExport = () => {
    console.log('Exporting dashboard data...');
  };

  const handleViewHotspotDetails = (hotspotId) => {
    console.log('Viewing hotspot details:', hotspotId);
  };

  const handleAcknowledgeHotspot = (hotspotId) => {
    console.log('Acknowledging hotspot:', hotspotId);
  };

  const handleSensorClick = (sensor) => {
    console.log('Sensor clicked:', sensor);
  };

  const handleEmergencyBroadcast = () => {
    console.log('Emergency broadcast initiated');
  };

  const handleRecomputeNearby = async () => {
    setRecomputing(true);
    try {
      await recomputeSessionCities();
      const names = await getSessionAllowlist();
      setAllowlist(names);
    } finally {
      setRecomputing(false);
    }
  };

  if (envLoading) {
    return <p>Loading environmental data...</p>;
  }

  if (!envData && !readings?.length) {
    return <p>No environmental data available yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="LayoutDashboard" size={22} color="var(--color-primary)" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Environmental Dashboard</h1>
          {lastFetchTime && (
            <span className="ml-auto text-xs text-muted-foreground">
              🕐 Last updated: {lastFetchTime.toLocaleTimeString()}
            </span>
          )}
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Real-time environmental monitoring and analysis • Auto-refresh every 30s
        </p>
      </div>

      {/* GPS Location Card */}
      <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="MapPin" size={24} color="var(--color-primary)" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Your Location
                {userLocation && (
                  <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </h3>
              {userLocation ? (
                <div className="text-sm text-muted-foreground mt-1">
                  <p className="text-base font-semibold text-foreground mb-1">{userLocation.name}</p>
                  <p className="text-xs text-muted-foreground">
                    📍 {userLocation.lat}°, {userLocation.lon}°
                    {userLocation.accuracy && (
                      <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${
                        parseFloat(userLocation.accuracy) < 50 ? 'bg-green-500/20 text-green-600' :
                        parseFloat(userLocation.accuracy) < 100 ? 'bg-yellow-500/20 text-yellow-600' :
                        'bg-orange-500/20 text-orange-600'
                      }`}>
                        ±{userLocation.accuracy}m
                      </span>
                    )}
                  </p>
                  {userLocationData?.recorded_at && (
                    <p className="text-xs mt-1 flex items-center gap-2">
                      <span>Updated: {new Date(userLocationData.recorded_at).toLocaleString()}</span>
                      {userLocationData.dataAge !== undefined && (
                        <span className={`px-1.5 py-0.5 rounded font-medium ${
                          userLocationData.dataAge < 60 ? 'bg-green-500/20 text-green-600' :
                          userLocationData.dataAge < 300 ? 'bg-yellow-500/20 text-yellow-600' :
                          'bg-red-500/20 text-red-600'
                        }`}>
                          {userLocationData.dataAge < 60 ? '🟢 Fresh' : 
                           userLocationData.dataAge < 300 ? '🟡 Recent' : '🔴 Stale'}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {locationError ? `❌ ${locationError}` : 'Fetch real-time environmental data for your precise GPS location'}
                </p>
              )}
            </div>
          </div>
          <Button
            variant={userLocation ? "outline" : "default"}
            iconName={locationLoading ? "Loader2" : "Navigation"}
            iconPosition="left"
            onClick={fetchUserLocationData}
            disabled={locationLoading}
            className={locationLoading ? "animate-spin-icon" : ""}
          >
            {locationLoading ? 'Detecting...' : userLocation ? 'Refresh' : 'Detect My Location'}
          </Button>
        </div>
        
        {userLocationData && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-background/50 rounded-md p-2 text-center">
              <div className="text-xs text-muted-foreground">AQI</div>
              <div className="text-lg font-bold text-foreground">{userLocationData.aqi !== null && userLocationData.aqi !== undefined ? Math.round(userLocationData.aqi) : '—'}</div>
            </div>
            <div className="bg-background/50 rounded-md p-2 text-center">
              <div className="text-xs text-muted-foreground">Temperature</div>
              <div className="text-lg font-bold text-foreground">
                {userLocationData.temperature !== null && userLocationData.temperature !== undefined 
                  ? `${Number(userLocationData.temperature).toFixed(1)}°C` 
                  : '—'}
              </div>
            </div>
            <div className="bg-background/50 rounded-md p-2 text-center">
              <div className="text-xs text-muted-foreground">Noise</div>
              <div className="text-lg font-bold text-foreground">
                {userLocationData.noise_level !== null && userLocationData.noise_level !== undefined
                  ? `${Number(userLocationData.noise_level).toFixed(1)} dB` 
                  : '—'}
              </div>
            </div>
            <div className="bg-background/50 rounded-md p-2 text-center">
              <div className="text-xs text-muted-foreground">Humidity</div>
              <div className="text-lg font-bold text-foreground">
                {userLocationData.humidity !== null && userLocationData.humidity !== undefined
                  ? `${Math.round(userLocationData.humidity)}%` 
                  : '—'}
              </div>
            </div>
          </div>
        )}
      </div>

      <FilterControls
        timeRange={timeRange}
        location={location}
        parameter={parameter}
        onTimeRangeChange={setTimeRange}
        onLocationChange={setLocation}
        onParameterChange={setParameter}
        onRefresh={handleRefreshData}
        onExport={handleExport}
      />

      <QuickStats stats={quickStats} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {metrics?.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <SensorMap 
            sensors={sensors}
            userLocation={userLocation}
            onSensorClick={handleSensorClick}
          />
        </div>

        <div className="bg-card rounded-lg border border-border p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold">Quick Actions</h3>
            <Icon name="Zap" size={20} color="var(--color-primary)" />
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              iconName={recomputing ? 'Loader2' : 'RefreshCw'}
              iconPosition="left"
              fullWidth
              onClick={handleRecomputeNearby}
              disabled={recomputing}
            >
              {recomputing ? 'Recomputing Nearby Cities…' : 'Recompute Nearby Cities'}
            </Button>

            <Button
              variant="destructive"
              iconName="Siren"
              iconPosition="left"
              fullWidth
              onClick={handleEmergencyBroadcast}
            >
              Emergency Broadcast
            </Button>

            <Button
              variant="outline"
              iconName="FileText"
              iconPosition="left"
              fullWidth
              onClick={() => navigate('/historical-reports')}
            >
              View Reports
            </Button>

            <Button
              variant="outline"
              iconName="Settings"
              iconPosition="left"
              fullWidth
            >
              Configure Alerts
            </Button>

            <Button
              variant="outline"
              iconName="Users"
              iconPosition="left"
              fullWidth
            >
              Manage Team
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium mb-3">System Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-muted-foreground">Backend API</span>
                <span className={`text-xs md:text-sm font-medium ${
                  backendStatus.status === 'operational' ? 'text-success' : 
                  backendStatus.status === 'checking' ? 'text-warning' : 'text-error'
                }`}>
                  {backendStatus.status === 'operational' ? '✓ Operational' : 
                   backendStatus.status === 'checking' ? '⏳ Checking...' : '✗ Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-muted-foreground">Database</span>
                <span className="text-xs md:text-sm text-success font-medium">✓ Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-muted-foreground">Map Data</span>
                <span className={`text-xs md:text-sm font-medium ${
                  sensors.length > 0 ? 'text-success' : 'text-warning'
                }`}>
                  {sensors.length > 0 ? `✓ ${sensors.length} sensors` : '⏳ Loading...'}
                </span>
              </div>
              {backendStats?.timestamp && (
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">Last Update</span>
                  <span className="text-xs md:text-sm text-muted-foreground">
                    {new Date(backendStats.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="AlertTriangle" size={20} color="var(--color-error)" />
            <h3 className="text-base md:text-lg font-semibold">Active Hotspots</h3>
          </div>
          <span className="text-xs md:text-sm text-muted-foreground">
            {hotspots?.length} active alerts
          </span>
        </div>

        <HotspotAlert
          hotspots={hotspots}
          onViewDetails={handleViewHotspotDetails}
          onAcknowledge={handleAcknowledgeHotspot}
        />
      </div>
    </div>
  );
};

export default EnvironmentalDashboard;