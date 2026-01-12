import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import TemperatureChart from './components/TemperatureChart';
import TemperatureStatCard from './components/TemperatureStatCard';
import LocationSelector from './components/LocationSelector';
import HeatMapVisualization from './components/HeatMapVisualization';
import AlertConfiguration from './components/AlertConfiguration';
import StatisticalAnalysis from './components/StatisticalAnalysis';
import ExportReportPanel from './components/ExportReportPanel';
import ComparativeAnalysis from './components/ComparativeAnalysis';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { useEnvironmentReadings, useLatestCityReadings } from '../../utils/dataHooks';
import { getSessionAllowlist } from '../../utils/sessionCities';

const TemperatureAnalytics = () => {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [chartType, setChartType] = useState('line');
  const [showHeatIndex, setShowHeatIndex] = useState(true);
  const [timePeriod, setTimePeriod] = useState('24h');
  const { data: readings, loading } = useEnvironmentReadings({ location: selectedLocation, limit: 100, realtime: true });
  const [allowlist, setAllowlist] = useState([]);
  const { data: latestCityReadings } = useLatestCityReadings({ fallbackWindow: 200, allowLocations: allowlist });
  React.useEffect(() => { (async () => { try { setAllowlist(await getSessionAllowlist()); } catch {} })(); }, []);
  const { data: allRecent } = useEnvironmentReadings({ location: null, limit: 200, realtime: false });
  

  const locations = useMemo(() => {
    if (latestCityReadings?.length) {
      return latestCityReadings.map(r => ({ id: r.location, name: r.location }));
    }
    const unique = new Set((readings || []).map(r => r.location).filter(Boolean));
    return [...unique].map(loc => ({ id: loc, name: loc }));
  }, [latestCityReadings, readings]);

  const temperatureData = useMemo(() => {
    const seq = (readings || []).slice().reverse();
    const calcHeatIndex = (t, rh) => {
      if (typeof t !== 'number' || typeof rh !== 'number') return null;
      // Simple feels-like approximation
      return Math.round(t + Math.max(0, (rh - 50) * 0.1));
    };
    return seq.map(r => ({
      time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      current: r?.temperature ?? null,
      high: r?.temperature ?? null,
      low: r?.temperature ?? null,
      heatIndex: calcHeatIndex(r?.temperature ?? null, r?.humidity ?? null),
    }));
  }, [readings]);

  const heatMapZones = useMemo(() => {
    return (latestCityReadings || []).map((r, i) => ({ id: i + 1, name: r.location, temperature: r.temperature ?? null, lat: r.latitude ?? 0, lng: r.longitude ?? 0 }));
  }, [latestCityReadings]);

  const statisticalData = {
    statistics: {
      mean: 26.5,
      median: 26.0,
      stdDev: 3.2,
      range: 14
    },
    distribution: [
      { month: 'Jan', average: 18 },
      { month: 'Feb', average: 19 },
      { month: 'Mar', average: 22 },
      { month: 'Apr', average: 25 },
      { month: 'May', average: 28 },
      { month: 'Jun', average: 32 },
      { month: 'Jul', average: 34 },
      { month: 'Aug', average: 33 },
      { month: 'Sep', average: 30 },
      { month: 'Oct', average: 26 },
      { month: 'Nov', average: 22 },
      { month: 'Dec', average: 19 }
    ],
    climateChange: {
      increase: 1.8,
      years: 10
    }
  };

  const comparativeLocations = useMemo(() => {
    const items = (latestCityReadings || []).slice(0, 5).map((r, i) => {
      const locRows = (allRecent || []).filter(x => x.location === r.location && typeof x.temperature === 'number');
      const temps = locRows.map(x => x.temperature);
      const current = r.temperature ?? (temps[0] ?? null);
      const avg24h = temps.length ? Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10 : current;
      const prev = temps[1] ?? current;
      const diff = current != null && prev != null ? Math.round((current - prev) * 10) / 10 : 0;
      return { id: i + 1, name: r.location, current, difference: diff, average24h: avg24h };
    });
    return items;
  }, [latestCityReadings, allRecent]);

  const timePeriodOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const chartTypeOptions = [
    { value: 'line', label: 'Line Chart' },
    { value: 'area', label: 'Area Chart' }
  ];

  const handleRefreshData = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  const handleDismissAlert = (alertId) => {
    setAlerts(alerts?.filter(alert => alert?.id !== alertId));
  };

  const handleSaveAlertConfig = (config) => {
    console.log('Alert configuration saved:', config);
  };

  const handleExportReport = (config) => {
    console.log('Exporting report with config:', config);
  };

  const handleZoneClick = (zone) => {
    console.log('Zone clicked:', zone);
  };

  const handleLocationSelect = (location) => {
    console.log('Location selected for comparison:', location);
  };

  return (
    <>
      <Helmet>
        <title>Temperature Analytics - EchoWatch</title>
        <meta name="description" content="Comprehensive thermal monitoring and climate trend analysis for environmental planning and public safety management" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Icon name="Thermometer" size={22} color="var(--color-primary)" />
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">Temperature Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">Thermal monitoring and climate trend analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {(() => {
            const temps = (readings || []).map(r => r?.temperature).filter(v => typeof v === 'number');
            const hums = (readings || []).map(r => r?.humidity).filter(v => typeof v === 'number');
            const current = temps?.[0] ?? null;
            const high = temps.length ? Math.max(...temps) : null;
            const low = temps.length ? Math.min(...temps) : null;
            const heatIndex = current != null && hums?.[0] != null ? Math.round(current + Math.max(0, (hums[0] - 50) * 0.1)) : null;
            return (
              <>
                <TemperatureStatCard title="Current Temperature" value={current ?? '--'} unit="°C" trend={null} trendValue={null} icon="Thermometer" color="var(--color-error)" description="Latest reading" />
                <TemperatureStatCard title="Daily High" value={high ?? '--'} unit="°C" trend={null} trendValue={null} icon="TrendingUp" color="var(--color-warning)" description="Max recent value" />
                <TemperatureStatCard title="Daily Low" value={low ?? '--'} unit="°C" trend={null} trendValue={null} icon="TrendingDown" color="var(--color-accent)" description="Min recent value" />
                <TemperatureStatCard title="Heat Index" value={heatIndex ?? '--'} unit="°C" trend={null} trendValue={null} icon="Flame" color="var(--color-error)" description="Feels like temperature" />
              </>
            );
          })()}
        </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon name="LineChart" size={20} color="var(--color-primary)" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">Temperature Trends</h2>
                        <p className="caption text-muted-foreground">Real-time thermal monitoring</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select
                        options={timePeriodOptions}
                        value={timePeriod}
                        onChange={setTimePeriod}
                        placeholder="Select period"
                      />
                      <Select
                        options={chartTypeOptions}
                        value={chartType}
                        onChange={setChartType}
                        placeholder="Chart type"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      variant={showHeatIndex ? 'default' : 'outline'}
                      size="sm"
                      iconName="Flame"
                      iconPosition="left"
                      onClick={() => setShowHeatIndex(!showHeatIndex)}
                    >
                      Heat Index
                    </Button>
                  </div>

                  <TemperatureChart 
                    data={temperatureData}
                    chartType={chartType}
                    showHeatIndex={showHeatIndex}
                  />
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <LocationSelector
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onLocationChange={setSelectedLocation}
                  showElevation={true}
                  loading={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <HeatMapVisualization 
                zones={heatMapZones}
                onZoneClick={handleZoneClick}
              />
              <ComparativeAnalysis
                locations={comparativeLocations}
                onLocationSelect={handleLocationSelect}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="lg:col-span-2">
                <StatisticalAnalysis 
                  data={statisticalData}
                  period="monthly"
                />
              </div>
              <div className="space-y-4 md:space-y-6">
                <AlertConfiguration onSave={handleSaveAlertConfig} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon name="Calendar" size={20} color="var(--color-primary)" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Historical Analysis</h3>
                      <p className="caption text-muted-foreground">Long-term climate patterns and trends</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon name="TrendingUp" size={20} color="var(--color-error)" />
                        <p className="font-medium text-foreground">Warming Trend</p>
                      </div>
                      <p className="caption text-muted-foreground mb-2">
                        Average temperature has increased by <span className="font-medium text-error">+1.8°C</span> over the past decade
                      </p>
                      <p className="caption text-muted-foreground">
                        This trend is consistent with urban heat island effects and requires mitigation strategies
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon name="AlertTriangle" size={20} color="var(--color-warning)" />
                        <p className="font-medium text-foreground">Extreme Events</p>
                      </div>
                      <p className="caption text-muted-foreground mb-2">
                        <span className="font-medium text-warning">23 heat wave days</span> recorded this year, up from 15 last year
                      </p>
                      <p className="caption text-muted-foreground">
                        Increased frequency of extreme temperature events requires enhanced public health measures
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <ExportReportPanel onExport={handleExportReport} />
            </div>
      </div>
    </>
  );
};

export default TemperatureAnalytics;