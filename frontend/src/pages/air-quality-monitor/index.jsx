import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import AQIChart from './components/AQIChart';
import SensorDataTable from './components/SensorDataTable';
import FilterControls from './components/FilterControls';
import AlertConfiguration from './components/AlertConfiguration';
import LocationComparison from './components/LocationComparison';
import { useEnvironmentReadings } from '../../utils/dataHooks';

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
  const { data: readings, loading } = useEnvironmentReadings({ location: filters.location === 'all' ? null : filters.location, limit: 100, realtime: true });

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
    
    // If no mapping found, return original (fallback)
    console.log('Unmapped location:', rawLocation);
    return rawLocation;
  };

  useEffect(() => {
    if (!readings?.length) return;
    const series = readings
      .slice()
      .reverse()
      .map(r => ({ time: new Date(r.recorded_at).toLocaleTimeString(), aqi: r.aqi ?? 0 }));
    setChartData(series);
    const sensors = readings.slice(0, 50).map((r, i) => ({
      id: i + 1,
      location: getLocationLabel(r.location),
      zone: getLocationLabel(r.location),
      aqi: r.aqi ?? 0,
      pm25: null,
      pm10: null,
      ozone: null,
      no2: null,
      lastUpdate: new Date(r.recorded_at).toLocaleTimeString(),
    }));
    setSensorData(sensors);
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

  return (
    <>
      <Helmet>
        <title>{`${t('aq.title')} - EcoWatch`}</title>
        <meta name="description" content={t('aq.subtitle')} />
      </Helmet>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t('aq.title')}</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            {t('aq.subtitle')}
          </p>
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
          selectedLocations={[t('locations.miRoad'), t('locations.industrialTonk'), t('locations.lakePichola'), t('locations.clockTower'), t('locations.pushkarRoad')]}
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