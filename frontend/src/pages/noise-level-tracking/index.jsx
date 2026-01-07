import React, { useMemo, useState } from 'react';
import RealtimeNoiseMeter from './components/RealtimeNoiseMeter';
import NoiseTimelineChart from './components/NoiseTimelineChart';
import LocationFilter from './components/LocationFilter';
import FrequencyAnalysisChart from './components/FrequencyAnalysisChart';
import AlertConfiguration from './components/AlertConfiguration';
import ComparativeAnalysis from './components/ComparativeAnalysis';
import ExportReports from './components/ExportReports';
import { RAJASTHAN_PLACES } from '../../utils/rajasthanLocations';
import { useEnvironmentReadings } from '../../utils/dataHooks';

const NoiseLevelTracking = () => {
  

  const [selectedLocation, setSelectedLocation] = useState('all');
  const { data: readings, loading } = useEnvironmentReadings({ location: selectedLocation, limit: 100 });

  const currentNoiseData = useMemo(() => {
    const levels = (readings || []).map(r => r?.noise_level).filter(v => typeof v === 'number');
    const current = levels?.[0] ?? 0;
    const peak = levels.length ? Math.max(...levels) : 0;
    const avg = levels.length ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length) : 0;
    const status = current >= 85 ? 'harmful' : current >= 70 ? 'concerning' : 'acceptable';
    return { currentLevel: current, peakLevel: peak, averageLevel: avg, status };
  }, [readings]);

  const timelineData = useMemo(() => {
    return (readings || [])
      .slice()
      .reverse()
      .map(r => ({ time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), level: r?.noise_level ?? 0 }));
  }, [readings]);

  const locations = useMemo(() => {
    const unique = new Set((readings || []).map(r => r.location).filter(Boolean));
    const base = [...unique].map(loc => ({ id: loc, name: loc, type: 'Unknown', sensors: 0, density: 'Unknown' }));
    if (base.length) return base;
    // Fallback demo locations
    return [
      { id: RAJASTHAN_PLACES?.[0]?.value || 'Jaipur', name: RAJASTHAN_PLACES?.[0]?.label || 'MI Road, Jaipur', type: 'Commercial', sensors: 12, density: 'High' },
      { id: RAJASTHAN_PLACES?.[1]?.value || 'Jodhpur', name: RAJASTHAN_PLACES?.[1]?.label || 'Clock Tower, Jodhpur', type: 'Educational', sensors: 8, density: 'Medium' },
    ];
  }, [readings]);

  
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

  // live data via Supabase, so no random simulation needed

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
            loading={loading}
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