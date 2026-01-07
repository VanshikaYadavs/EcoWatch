import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import AQIChart from './components/AQIChart';
import SensorDataTable from './components/SensorDataTable';
import FilterControls from './components/FilterControls';
import AlertConfiguration from './components/AlertConfiguration';
import LocationComparison from './components/LocationComparison';
import { useEnvironmentReadings } from '../../utils/dataHooks';

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

  useEffect(() => {
    if (!readings?.length) return;
    const series = readings
      .slice()
      .reverse()
      .map(r => ({ time: new Date(r.recorded_at).toLocaleTimeString(), aqi: r.aqi ?? 0 }));
    setChartData(series);
    const sensors = readings.slice(0, 50).map((r, i) => ({
      id: i + 1,
      location: r.location,
      zone: r.location,
      aqi: r.aqi ?? 0,
      pm25: null,
      pm10: null,
      ozone: null,
      no2: null,
      lastUpdate: new Date(r.recorded_at).toLocaleTimeString(),
    }));
    setSensorData(sensors);
    const comp = readings.slice(0, 10).map(r => ({ location: r.location, pm25: 0, pm10: 0, ozone: 0, no2: 0 }));
    setComparisonData(comp);
  }, [readings]);

  const locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'downtown', label: 'MI Road, Jaipur' },
    { value: 'industrial', label: 'Industrial Area, Tonk' },
    { value: 'riverside', label: 'Lake Pichola, Udaipur' },
    { value: 'highway', label: 'Clock Tower, Jodhpur' },
    { value: 'residential', label: 'Pushkar Road, Ajmer' },
    { value: 'university', label: 'Jaipur City' },
    { value: 'airport', label: 'Industrial Area, Bikaner' },
    { value: 'harbor', label: 'Tonk District' }
  ];

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
          selectedLocations={['MI Road, Jaipur', 'Industrial Area, Tonk', 'Lake Pichola, Udaipur', 'Clock Tower, Jodhpur', 'Pushkar Road, Ajmer']}
        />

        <AlertConfiguration
          onSave={handleSaveAlertConfig}
        />
      </div>
    </>
  );
};

export default AirQualityMonitor;