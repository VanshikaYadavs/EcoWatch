import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import AQIChart from './components/AQIChart';
import SensorDataTable from './components/SensorDataTable';
import FilterControls from './components/FilterControls';
import AlertConfiguration from './components/AlertConfiguration';
import LocationComparison from './components/LocationComparison';
import NearbyStations from './components/NearbyStations';
import { useEnvironmentReadings, useLatestCityReadings } from '../../utils/dataHooks';
import { getCurrentLocation } from '../../utils/location';
import { getNearbyCities } from '../../utils/nearbyCities';
import axios from 'axios';
import { getSessionAllowlist, recomputeSessionCities } from '../../utils/sessionCities';
import Button from '../../components/ui/Button';
import { supabase } from '../../utils/supabaseClient';
import { getNearbySensorsByLocation, getNearbySensors } from '../../utils/environmentService';

const AirQualityMonitor = () => {
  const [filters, setFilters] = useState({
    timeRange: '24hours',
    location: 'all',
    pollutants: ['pm25', 'pm10', 'ozone', 'no2'],
    aqiCategory: 'all'
  });

  const [chartData, setChartData] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const { data: readings, loading } = useEnvironmentReadings({ location: filters.location === 'all' ? null : filters.location, limit: 100, realtime: true });
  const [allowlist, setAllowlist] = useState([]);
  const { data: latestCityReadings } = useLatestCityReadings({ fallbackWindow: 150, allowLocations: allowlist });
  const [recomputing, setRecomputing] = useState(false);
  const [nearbySensors, setNearbySensors] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingSensors, setLoadingSensors] = useState(false);

  useEffect(() => {
    (async () => {
      try { setAllowlist(await getSessionAllowlist()); } catch {}
    })();
  }, []);

  // Fetch nearby sensors from backend
  useEffect(() => {
    fetchNearbySensors();
  }, []);

  const fetchNearbySensors = async () => {
    setLoadingSensors(true);
    try {
      // Try to get user's GPS location
      try {
        const { lat, lon } = await getCurrentLocation();
        setUserLocation({ lat, lon });
        console.log('🗺️ Fetching sensors near:', lat, lon);
        const sensors = await getNearbySensorsByLocation(lat, lon, 100); // 100km radius
        setNearbySensors(sensors);
        console.log('✅ Found', sensors.length, 'nearby sensors');
      } catch (geoError) {
        // Fallback: get all sensors without distance sorting
        console.log('📍 GPS unavailable, showing all sensors');
        const sensors = await getNearbySensors();
        setNearbySensors(sensors);
      }
    } catch (error) {
      console.error('Error fetching nearby sensors:', error);
    } finally {
      setLoadingSensors(false);
    }
  };

  // Ingest user's location + nearby cities on first load (in case user lands here directly)
  useEffect(() => {
    (async () => {
      try {
        const { lat, lon } = await getCurrentLocation();
        const { data: sessData } = await supabase.auth.getSession();
        const userId = sessData?.session?.user?.id;
        const token = sessData?.session?.access_token;
        if (!userId) {
          console.warn('Skipping ingest: missing user_id (not signed in)');
        }
        try {
          if (userId && token) {
            await axios.get(
              `http://localhost:8080/api/ingest/now?lat=${lat}&lon=${lon}&name=Your%20Location`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        } catch (e) {
          console.warn('AQM ingest (self) failed:', e?.message || e);
        }
        try {
          const nearby = await getNearbyCities(lat, lon);
          for (const city of nearby) {
            try {
              if (userId && token) {
                await axios.get(
                  `http://localhost:8080/api/ingest/now?lat=${city.lat}&lon=${city.lon}&name=${encodeURIComponent(city.name)}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              }
            } catch (e2) {
              console.warn('AQM ingest (nearby) failed:', city.name, e2?.message || e2);
            }
          }
        } catch (nearErr) {
          console.warn('Nearby cities lookup failed:', nearErr?.message || nearErr);
        }
      } catch (geoErr) {
        // Geolocation denied/unavailable — skip hardcoded fallback city to avoid confusion.
        console.warn('AQM geolocation unavailable/denied:', geoErr?.message || geoErr);
      }
    })();
  }, []);

  useEffect(() => {
    const srcReadings = latestCityReadings?.length ? latestCityReadings : readings || [];
    if (!srcReadings?.length) return;
    const series = (readings || [])
      .slice()
      .reverse()
      .map(r => ({ time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), aqi: r.aqi ?? 0 }));
    setChartData(series);
    
    // Use nearby sensors if available (more accurate GPS-based data), otherwise use database readings
    let sensorsToDisplay = [];
    if (nearbySensors && nearbySensors.length > 0) {
      sensorsToDisplay = nearbySensors.slice(0, 50).map((s, i) => ({
        id: s.id || i + 1,
        location: s.location,
        zone: s.location,
        aqi: s.aqi ?? 0,
        pm25: null,
        pm10: null,
        ozone: null,
        no2: null,
        lastUpdate: s.recorded_at ? new Date(s.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        distance: s.distance ? `${s.distance.toFixed(1)}km` : null
      }));
    } else {
      sensorsToDisplay = srcReadings.slice(0, 50).map((r, i) => ({
        id: i + 1,
        location: r.location,
        zone: r.location,
        aqi: r.aqi ?? 0,
        pm25: null,
        pm10: null,
        ozone: null,
        no2: null,
        lastUpdate: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    }
    
    setSensorData(sensorsToDisplay);
    const comp = srcReadings.slice(0, 10).map(r => ({ location: r.location, pm25: 0, pm10: 0, ozone: 0, no2: 0 }));
    setComparisonData(comp);
  }, [readings, latestCityReadings, nearbySensors]);

  const locationOptions = useMemo(() => {
    const dynamic = (latestCityReadings || []).map(r => ({ value: r.location, label: r.location }));
    return [{ value: 'all', label: 'All Locations' }, ...dynamic];
  }, [latestCityReadings]);

  const pollutantOptions = [
    { value: 'pm25', label: 'PM2.5 (Fine Particles)' },
    { value: 'pm10', label: 'PM10 (Coarse Particles)' },
    { value: 'ozone', label: 'Ozone (O₃)' },
    { value: 'no2', label: 'Nitrogen Dioxide (NO₂)' },
    { value: 'so2', label: 'Sulfur Dioxide (SO₂)' },
    { value: 'co', label: 'Carbon Monoxide (CO)' }
  ];

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({
        timeRange: '24hours',
        location: 'all',
        pollutants: ['pm25', 'pm10', 'ozone', 'no2'],
        aqiCategory: 'all'
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleExport = () => {
    console.log('Exporting air quality report with filters:', filters);
    alert('Report export initiated. Download will begin shortly.');
  };

  const handleLocationClick = (sensor) => {
    console.log('Viewing details for:', sensor?.location);
    alert(`Detailed view for ${sensor?.location}\nAQI: ${sensor?.aqi}\nCategory: ${sensor?.aqi <= 50 ? 'Good' : sensor?.aqi <= 100 ? 'Moderate' : 'Unhealthy'}`);
  };

  const handleSaveAlertConfig = (config) => {
    console.log('Saving alert configuration:', config);
    alert('Alert configuration saved successfully!');
  };

  async function handleRecomputeNearby() {
    setRecomputing(true);
    try {
      await recomputeSessionCities();
      const names = await getSessionAllowlist();
      setAllowlist(names);
    } finally {
      setRecomputing(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Air Quality Monitor - EchoWatch</title>
        <meta name="description" content="Real-time air quality monitoring and analysis with AQI tracking, pollutant measurements, and environmental health alerts for smart city management." />
      </Helmet>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Air Quality Monitor</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Real-time AQI tracking and pollutant analysis across monitoring stations
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              iconName={recomputing ? 'Loader2' : 'RefreshCw'}
              iconPosition="left"
              onClick={handleRecomputeNearby}
              disabled={recomputing}
            >
              {recomputing ? 'Recomputing Nearby Cities…' : 'Recompute Nearby Cities'}
            </Button>
          </div>
        </div>

        <FilterControls
          filters={filters}
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          locations={locationOptions}
          pollutantTypes={pollutantOptions}
        />

        <AQIChart
          data={chartData}
          timeRange={filters?.timeRange}
          selectedPollutants={filters?.pollutants}
        />

        <NearbyStations
          sensors={nearbySensors}
          userLocation={userLocation}
          loading={loadingSensors}
          onRefresh={fetchNearbySensors}
        />

        <SensorDataTable
          sensors={sensorData}
          onLocationClick={handleLocationClick}
        />

        <LocationComparison
          comparisonData={comparisonData}
          selectedLocations={(latestCityReadings || []).slice(0, 5).map(r => r.location)}
        />

        <AlertConfiguration
          onSave={handleSaveAlertConfig}
        />
      </div>
    </>
  );
};

export default AirQualityMonitor;