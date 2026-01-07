import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import AQIChart from './components/AQIChart';
import SensorDataTable from './components/SensorDataTable';
import FilterControls from './components/FilterControls';
import AlertConfiguration from './components/AlertConfiguration';
import LocationComparison from './components/LocationComparison';

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

  useEffect(() => {
    const mockChartData = [
      { time: '00:00', aqi: 45, pm25: 12, pm10: 25, ozone: 35, no2: 15 },
      { time: '02:00', aqi: 52, pm25: 15, pm10: 28, ozone: 38, no2: 18 },
      { time: '04:00', aqi: 48, pm25: 13, pm10: 26, ozone: 36, no2: 16 },
      { time: '06:00', aqi: 65, pm25: 22, pm10: 35, ozone: 45, no2: 25 },
      { time: '08:00', aqi: 85, pm25: 32, pm10: 48, ozone: 55, no2: 35 },
      { time: '10:00', aqi: 95, pm25: 38, pm10: 55, ozone: 62, no2: 42 },
      { time: '12:00', aqi: 102, pm25: 42, pm10: 62, ozone: 68, no2: 48 },
      { time: '14:00', aqi: 98, pm25: 40, pm10: 58, ozone: 65, no2: 45 },
      { time: '16:00', aqi: 88, pm25: 35, pm10: 52, ozone: 58, no2: 38 },
      { time: '18:00', aqi: 92, pm25: 37, pm10: 54, ozone: 60, no2: 40 },
      { time: '20:00', aqi: 78, pm25: 28, pm10: 42, ozone: 50, no2: 32 },
      { time: '22:00', aqi: 62, pm25: 20, pm10: 32, ozone: 42, no2: 22 }
    ];

    const mockSensorData = [
      {
        id: 1,
        location: 'MI Road, Jaipur',
        zone: 'Jaipur',
        aqi: 102,
        pm25: 42,
        pm10: 62,
        ozone: 68,
        no2: 48,
        lastUpdate: '2 min ago'
      },
      {
        id: 2,
        location: 'Industrial Area, Tonk',
        zone: 'Tonk',
        aqi: 145,
        pm25: 65,
        pm10: 95,
        ozone: 82,
        no2: 72,
        lastUpdate: '1 min ago'
      },
      {
        id: 3,
        location: 'Lake Pichola, Udaipur',
        zone: 'Udaipur',
        aqi: 48,
        pm25: 13,
        pm10: 26,
        ozone: 36,
        no2: 16,
        lastUpdate: '3 min ago'
      },
      {
        id: 4,
        location: 'Clock Tower, Jodhpur',
        zone: 'Jodhpur',
        aqi: 118,
        pm25: 52,
        pm10: 75,
        ozone: 72,
        no2: 58,
        lastUpdate: '1 min ago'
      },
      {
        id: 5,
        location: 'Pushkar Road, Ajmer',
        zone: 'Ajmer',
        aqi: 68,
        pm25: 24,
        pm10: 38,
        ozone: 48,
        no2: 28,
        lastUpdate: '2 min ago'
      },
      {
        id: 6,
        location: 'Jaipur City',
        zone: 'Jaipur',
        aqi: 55,
        pm25: 18,
        pm10: 30,
        ozone: 40,
        no2: 20,
        lastUpdate: '4 min ago'
      },
      {
        id: 7,
        location: 'Industrial Area, Bikaner',
        zone: 'Bikaner',
        aqi: 92,
        pm25: 37,
        pm10: 54,
        ozone: 60,
        no2: 40,
        lastUpdate: '1 min ago'
      },
      {
        id: 8,
        location: 'Tonk District',
        zone: 'Tonk',
        aqi: 108,
        pm25: 45,
        pm10: 68,
        ozone: 70,
        no2: 52,
        lastUpdate: '2 min ago'
      }
    ];

    const mockComparisonData = [
      { location: 'MI Road, Jaipur', pm25: 42, pm10: 62, ozone: 68, no2: 48 },
      { location: 'Industrial Area, Tonk', pm25: 65, pm10: 95, ozone: 82, no2: 72 },
      { location: 'Lake Pichola, Udaipur', pm25: 13, pm10: 26, ozone: 36, no2: 16 },
      { location: 'Clock Tower, Jodhpur', pm25: 52, pm10: 75, ozone: 72, no2: 58 },
      { location: 'Pushkar Road, Ajmer', pm25: 24, pm10: 38, ozone: 48, no2: 28 }
    ];

    setChartData(mockChartData);
    setSensorData(mockSensorData);
    setComparisonData(mockComparisonData);
  }, []);

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