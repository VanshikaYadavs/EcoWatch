import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import AQIChart from './components/AQIChart';
import SensorDataTable from './components/SensorDataTable';
import FilterControls from './components/FilterControls';
import AlertConfiguration from './components/AlertConfiguration';
import LocationComparison from './components/LocationComparison';
<<<<<<< HEAD
import { useEnvironmentReadings, useLatestCityReadings } from '../../utils/dataHooks';
import { getCurrentLocation, displayLocation } from '../../utils/location';
import { getNearbyCities } from '../../utils/nearbyCities';
import axios from 'axios';
import { getSessionAllowlist, recomputeSessionCities } from '../../utils/sessionCities';
import Button from '../../components/ui/Button';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';
=======
import { useEnvironmentReadings } from '../../utils/dataHooks';
import { translateText, getCachedTranslation } from '../../utils/translationService';
import AutoText from '../../components/ui/AutoText';
>>>>>>> translation

const AirQualityMonitor = () => {
  const { t, i18n } = useTranslation();

  const [filters, setFilters] = useState({
    timeRange: '24hours',
    location: 'all',
    pollutants: ['pm25', 'pm10', 'ozone', 'no2'],
    aqiCategory: 'all'
  });

  const [chartData, setChartData] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { data: readings, loading } = useEnvironmentReadings({ location: filters.location === 'all' ? null : filters.location, limit: 100, realtime: true });
  const [allowlist, setAllowlist] = useState([]);
  const { data: latestCityReadings } = useLatestCityReadings({ fallbackWindow: 150, allowLocations: allowlist });
  const [recomputing, setRecomputing] = useState(false);
  const [backendLatest, setBackendLatest] = useState([]);

  // Map Hindi location names from backend to location translation keys
  const getLocationLabel = (rawLocation) => {
    const locationMap = {
      // Hindi names
      'एमआय रोड, जयपूर': 'locations.miRoad',
      'औद्योगिक क्षेत्र, टोंक': 'locations.industrialTonk',
      'लेक पिचोला, उदयपूर': 'locations.lakePichola',
      'क्लॉक टॉवर, जोधपूर': 'locations.clockTower',
      'पुष्कर रोड, अजमेर': 'locations.pushkarRoad',
      'औद्योगिक क्षेत्र, बीकानेर': 'locations.bikanerIndustrial',
      'जयपूर शहर': 'temp.locations.jaipur',
      'टोंक जिल्हा': 'temp.locations.tonk',
      // English/mixed names that might come from backend
      'Jaipur': 'temp.locations.jaipur',
      'Adarsh Nagar': 'locations.miRoad',
      'Tonk': 'locations.industrialTonk',
      'Udaipur': 'locations.lakePichola',
      'Jodhpur': 'locations.clockTower',
      'Ajmer': 'locations.pushkarRoad',
      'Bikaner': 'locations.bikanerIndustrial',
      'Noida': 'locations.miRoad',
      'Yamunapuram': 'locations.pushkarRoad'
    };
    
    const translationKey = locationMap[rawLocation];
    if (translationKey) {
      return t(translationKey);
    }
    
    // If no mapping found, check if there's a cached API translation
    if (i18n.language !== 'en') {
      const cached = getCachedTranslation(rawLocation, i18n.language);
      if (cached) {
        console.log('Using cached translation:', rawLocation, '->', cached);
        return cached;
      }
      
      // Trigger API translation in background
      console.log('Unmapped location, will use API translation:', rawLocation);
      translateText(rawLocation, i18n.language)
        .then(translated => {
          console.log('Got API translation:', rawLocation, '->', translated);
          // Force re-render to display the translated name
          setForceUpdate(prev => prev + 1);
        })
        .catch(err => console.error('Failed to translate location:', err));
    }
    
    return rawLocation;
  };

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
<<<<<<< HEAD
      location: displayLocation(r.location, r.location),
      zone: displayLocation(r.location, r.location),
=======
      location: getLocationLabel(r.location),
      zone: getLocationLabel(r.location),
>>>>>>> translation
      aqi: r.aqi ?? 0,
      pm25: r.pm25 ?? null,
      pm10: r.pm10 ?? null,
      ozone: r.o3 ?? null,
      no2: r.no2 ?? null,
      lastUpdate: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    setSensorData(sensors);
<<<<<<< HEAD

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
=======
    const comp = readings.slice(0, 10).map(r => ({ location: getLocationLabel(r.location), pm25: 0, pm10: 0, ozone: 0, no2: 0 }));
    setComparisonData(comp);
  }, [readings, t]);

  const locationOptions = [
    { value: 'all', label: t('aq.locations.all') },
    { value: 'downtown', label: t('locations.miRoad') },
    { value: 'industrial', label: t('locations.industrialTonk') },
    { value: 'riverside', label: t('locations.lakePichola') },
    { value: 'highway', label: t('locations.clockTower') },
    { value: 'residential', label: t('locations.pushkarRoad') },
    { value: 'university', label: t('temp.locations.jaipur') },
    { value: 'airport', label: t('locations.bikanerIndustrial') },
    { value: 'harbor', label: t('temp.locations.tonk') }
  ];
>>>>>>> translation

  const pollutantOptions = [
    { value: 'pm25', label: t('aq.pollutants.pm25') },
    { value: 'pm10', label: t('aq.pollutants.pm10') },
    { value: 'ozone', label: t('aq.pollutants.ozone') },
    { value: 'no2', label: t('aq.pollutants.no2') },
    { value: 'so2', label: t('aq.pollutants.so2') },
    { value: 'co', label: t('aq.pollutants.co') }
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
        <title>{`${t('aq.title')} - EcoWatch`}</title>
        <meta name="description" content={t('aq.subtitle')} />
      </Helmet>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground"><AutoText i18nKey="aq.title" defaultText="Air Quality Monitor" /></h1>
          <p className="text-base md:text-lg text-muted-foreground">
            <AutoText i18nKey="aq.subtitle" defaultText="Real-time AQI tracking and pollutant analysis across monitoring stations" />
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
<<<<<<< HEAD
          selectedLocations={(latestCityReadings || []).slice(0, 5).map(r => r.location)}
=======
          selectedLocations={[t('locations.miRoad'), t('locations.industrialTonk'), t('locations.lakePichola'), t('locations.clockTower'), t('locations.pushkarRoad')]}
>>>>>>> translation
        />

        <AlertConfiguration
          key={`alert-config-${i18n.language}`}
          onSave={handleSaveAlertConfig}
        />
      </div>
    </>
  );
};

export default AirQualityMonitor;