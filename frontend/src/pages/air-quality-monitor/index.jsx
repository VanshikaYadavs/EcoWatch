import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import AQIChart from './components/AQIChart';
import SensorDataTable from './components/SensorDataTable';
import FilterControls from './components/FilterControls';
import AlertConfiguration from './components/AlertConfiguration';
import LocationComparison from './components/LocationComparison';
import { useEnvironmentReadings, useLatestCityReadings } from '../../utils/dataHooks';
import { getCurrentLocation, displayLocation } from '../../utils/location';
import { getNearbyCities } from '../../utils/nearbyCities';
import axios from 'axios';
import { getSessionAllowlist, recomputeSessionCities } from '../../utils/sessionCities';
import Button from '../../components/ui/Button';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';

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
  const [backendLatest, setBackendLatest] = useState([]);

  useEffect(() => {
    (async () => {
      try { setAllowlist(await getSessionAllowlist()); } catch {}
    })();
  }, []);

  // Ingest user's location + nearby cities on first load (in case user lands here directly)
  useEffect(() => {
    (async () => {
      try {
        const { lat, lon } = await getCurrentLocation();
        let userId = null, token = null;
        if (isSupabaseConfigured && supabase) {
          const { data: sessData } = await supabase.auth.getSession();
          userId = sessData?.session?.user?.id;
          token = sessData?.session?.access_token;
        }
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

  // Fallback: if Supabase path returns too few rows, fetch server latest-by-city
  useEffect(() => {
    (async () => {
      try {
        const names = Array.isArray(allowlist) ? allowlist.filter(Boolean) : [];
        if (names.length <= 1) { setBackendLatest([]); return; }
        if ((latestCityReadings || []).length >= Math.min(2, names.length)) { setBackendLatest([]); return; }
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
        const url = `${API_BASE}/api/readings/latest-by-city?cities=${encodeURIComponent(names.join(','))}`;
        const resp = await axios.get(url);
        const map = resp?.data?.data || {};
        const arr = Object.keys(map).map(k => map[k]).filter(Boolean);
        setBackendLatest(arr);
      } catch (e) {
        setBackendLatest([]);
      }
    })();
  }, [Array.isArray(allowlist) ? allowlist.join('|') : '', (latestCityReadings || []).length]);

  useEffect(() => {
    const srcReadings = backendLatest?.length ? backendLatest : (latestCityReadings?.length ? latestCityReadings : readings || []);
    if (!srcReadings?.length) return;
    // Build time series including pollutant breakdown
    const series = (readings || [])
      .slice()
      .reverse()
      .map(r => ({
        time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aqi: r.aqi ?? 0,
        pm25: r.pm25 ?? null,
        pm10: r.pm10 ?? null,
        ozone: r.o3 ?? null,
        no2: r.no2 ?? null,
      }));
    setChartData(series);

    // Sensor rows per location with latest pollutant values
    const sensors = srcReadings.slice(0, 50).map((r, i) => ({
      id: i + 1,
      location: displayLocation(r.location, r.location),
      zone: displayLocation(r.location, r.location),
      aqi: r.aqi ?? 0,
      pm25: r.pm25 ?? null,
      pm10: r.pm10 ?? null,
      ozone: r.o3 ?? null,
      no2: r.no2 ?? null,
      lastUpdate: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    setSensorData(sensors);

    // Comparison dataset per city (latest values)
    const comp = srcReadings.slice(0, 10).map(r => ({
      location: displayLocation(r.location, r.location),
      pm25: r.pm25 ?? 0,
      pm10: r.pm10 ?? 0,
      ozone: r.o3 ?? 0,
      no2: r.no2 ?? 0,
    }));
    setComparisonData(comp);
  }, [readings, latestCityReadings, backendLatest]);

  const locationOptions = useMemo(() => {
    const base = backendLatest?.length ? backendLatest : (latestCityReadings || []);
    const dynamic = base.map(r => ({ value: r.location, label: r.location }));
    return [{ value: 'all', label: 'All Locations' }, ...dynamic];
  }, [latestCityReadings, backendLatest]);

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