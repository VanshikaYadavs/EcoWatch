import React, { useState, useEffect } from 'react';
import RealtimeNoiseMeter from './components/RealtimeNoiseMeter';
import NoiseTimelineChart from './components/NoiseTimelineChart';
import LocationFilter from './components/LocationFilter';
import FrequencyAnalysisChart from './components/FrequencyAnalysisChart';
import AlertConfiguration from './components/AlertConfiguration';
import ComparativeAnalysis from './components/ComparativeAnalysis';
import ExportReports from './components/ExportReports';
import { RAJASTHAN_PLACES } from '../../utils/rajasthanLocations';

const NoiseLevelTracking = () => {
  

  const [currentNoiseData, setCurrentNoiseData] = useState({
    currentLevel: 68,
    peakLevel: 82,
    averageLevel: 61,
    status: 'concerning'
  });

  const [timelineData, setTimelineData] = useState([
    { time: '00:00', level: 45 },
    { time: '02:00', level: 42 },
    { time: '04:00', level: 48 },
    { time: '06:00', level: 58 },
    { time: '08:00', level: 72 },
    { time: '10:00', level: 68 },
    { time: '12:00', level: 75 },
    { time: '14:00', level: 71 },
    { time: '16:00', level: 78 },
    { time: '18:00', level: 82 },
    { time: '20:00', level: 65 },
    { time: '22:00', level: 52 }
  ]);

  const [locations, setLocations] = useState([
    { id: 'loc1', name: RAJASTHAN_PLACES?.[0]?.label || 'MI Road, Jaipur', type: 'Commercial', sensors: 12, density: 'High' },
    { id: 'loc2', name: RAJASTHAN_PLACES?.[1]?.label || 'Clock Tower, Jodhpur', type: 'Educational', sensors: 8, density: 'Medium' },
    { id: 'loc3', name: RAJASTHAN_PLACES?.[2]?.label || 'Lake Pichola, Udaipur', type: 'Healthcare', sensors: 15, density: 'High' },
    { id: 'loc4', name: RAJASTHAN_PLACES?.[3]?.label || 'Pushkar Road, Ajmer', type: 'Residential', sensors: 10, density: 'Medium' },
    { id: 'loc5', name: RAJASTHAN_PLACES?.[4]?.label || 'Industrial Area, Tonk', type: 'Industrial', sensors: 6, density: 'Low' }
  ]);

  const [selectedLocation, setSelectedLocation] = useState('loc1');
  const [customThresholds, setCustomThresholds] = useState({
    acceptable: 55,
    concerning: 70,
    harmful: 85
  });

  const [frequencyData, setFrequencyData] = useState([
    { source: 'Traffic - Highway', frequency: 250, intensity: 45 },
    { source: 'Traffic - Local Roads', frequency: 180, intensity: 35 },
    { source: 'Construction - Heavy Machinery', frequency: 500, intensity: 65 },
    { source: 'Construction - Tools', frequency: 350, intensity: 40 },
    { source: 'Industrial - Manufacturing', frequency: 420, intensity: 55 },
    { source: 'Industrial - Ventilation', frequency: 150, intensity: 30 },
    { source: 'Public Transport', frequency: 200, intensity: 38 },
    { source: 'Commercial Activities', frequency: 120, intensity: 25 }
  ]);

  const [alertSettings, setAlertSettings] = useState({
    email: true,
    sms: false,
    push: true,
    dashboard: true,
    thresholdExceeded: true,
    prolongedExposure: true,
    suddenSpike: false,
    regulationViolation: true,
    criticalPriority: true,
    highPriority: true,
    standardPriority: false
  });

  const [comparativeZones, setComparativeZones] = useState([
    { id: 1, name: RAJASTHAN_PLACES?.[0]?.label || 'MI Road, Jaipur', type: 'Commercial', sensors: 12, currentLevel: 68, peakLevel: 82, averageLevel: 61, trend: 8, compliant: false },
    { id: 2, name: RAJASTHAN_PLACES?.[1]?.label || 'Clock Tower, Jodhpur', type: 'Educational', sensors: 8, currentLevel: 52, peakLevel: 58, averageLevel: 48, trend: -3, compliant: true },
    { id: 3, name: RAJASTHAN_PLACES?.[2]?.label || 'Lake Pichola, Udaipur', type: 'Healthcare', sensors: 15, currentLevel: 48, peakLevel: 55, averageLevel: 45, trend: 2, compliant: true },
    { id: 4, name: RAJASTHAN_PLACES?.[3]?.label || 'Pushkar Road, Ajmer', type: 'Residential', sensors: 10, currentLevel: 58, peakLevel: 65, averageLevel: 54, trend: 5, compliant: false },
    { id: 5, name: RAJASTHAN_PLACES?.[4]?.label || 'Industrial Area, Tonk', type: 'Industrial', sensors: 6, currentLevel: 75, peakLevel: 88, averageLevel: 72, trend: 12, compliant: false }
  ]);

  const [exportSettings, setExportSettings] = useState({
    reportType: 'compliance',
    format: 'pdf',
    timeRange: 'last24h'
  });

  const [timeRange, setTimeRange] = useState('Last 24 Hours');

  useEffect(() => {
    const interval = setInterval(() => {
      const newLevel = Math.floor(Math.random() * 30) + 50;
      setCurrentNoiseData(prev => ({
        ...prev,
        currentLevel: newLevel,
        peakLevel: Math.max(prev?.peakLevel, newLevel),
        averageLevel: Math.floor((prev?.averageLevel + newLevel) / 2)
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleLocationChange = (locationId) => {
    setSelectedLocation(locationId);
  };

  const handleThresholdChange = (type, value) => {
    setCustomThresholds(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleAlertSettingsChange = (setting, value) => {
    setAlertSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveAlertSettings = () => {
    console.log('Alert settings saved:', alertSettings);
  };

  const handleExportSettingsChange = (setting, value) => {
    setExportSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleExport = () => {
    console.log('Exporting report with settings:', exportSettings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-foreground">Noise Level Tracking</h1>
        <p className="text-sm text-muted-foreground">Acoustic monitoring and compliance insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4 md:space-y-6 lg:space-y-8">
          <RealtimeNoiseMeter
            currentLevel={currentNoiseData?.currentLevel}
            peakLevel={currentNoiseData?.peakLevel}
            averageLevel={currentNoiseData?.averageLevel}
            status={currentNoiseData?.status}
          />

          <NoiseTimelineChart
            data={timelineData}
            timeRange={timeRange}
          />

          <FrequencyAnalysisChart
            data={frequencyData}
          />

          <ComparativeAnalysis
            zones={comparativeZones}
          />
        </div>

        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          <LocationFilter
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
            locations={locations}
            customThresholds={customThresholds}
            onThresholdChange={handleThresholdChange}
          />

          <AlertConfiguration
            alertSettings={alertSettings}
            onSettingsChange={handleAlertSettingsChange}
            onSaveSettings={handleSaveAlertSettings}
          />

          <ExportReports
            exportSettings={exportSettings}
            onSettingsChange={handleExportSettingsChange}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  );
};

export default NoiseLevelTracking;