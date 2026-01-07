import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from './components/MetricCard';
import SensorMap from './components/SensorMap';
import FilterControls from './components/FilterControls';
import HotspotAlert from './components/HotspotAlert';
import QuickStats from './components/QuickStats';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useEnvironmentReadings, useAlertEvents } from '../../utils/dataHooks';

const EnvironmentalDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('realtime');
  const [location, setLocation] = useState('all');
  const [parameter, setParameter] = useState('all');

  const { data: readings } = useEnvironmentReadings({ location: location === 'all' ? null : location, limit: 100, realtime: true });
  const { data: alerts } = useAlertEvents({ limit: 20 });

  const latest = useMemo(() => readings?.[0] || {}, [readings]);
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
      value: String(latest?.aqi ?? avg.aqi ?? '—'),
      unit: 'AQI',
      status: (latest?.aqi ?? avg.aqi) >= 150 ? 'poor' : 'good',
      trend: 'up',
      trendValue: '',
      icon: 'Wind',
      threshold: '150',
      onClick: () => navigate('/air-quality-monitor')
    },
    {
      title: 'Noise Level',
      value: String(latest?.noise_level ?? avg.noise ?? '—'),
      unit: 'dB',
      status: (latest?.noise_level ?? avg.noise) >= 85 ? 'critical' : 'moderate',
      trend: 'down',
      trendValue: '',
      icon: 'Volume2',
      threshold: '85',
      onClick: () => navigate('/noise-level-tracking')
    },
    {
      title: 'Temperature',
      value: String(latest?.temperature ?? avg.temp ?? '—'),
      unit: '°C',
      status: (latest?.temperature ?? avg.temp) >= 35 ? 'poor' : 'good',
      trend: 'up',
      trendValue: '',
      icon: 'Thermometer',
      threshold: '35',
      onClick: () => navigate('/temperature-analytics')
    },
    {
      title: 'Humidity',
      value: String(latest?.humidity ?? avg.humidity ?? '—'),
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
      value: String(avg?.sensors ?? readings?.length ?? 0),
      unit: 'online',
      status: 'good',
      trend: 'up',
      trendValue: '',
      icon: 'Radio',
      threshold: '50',
      onClick: () => {}
    }
  ];

  const quickStats = [
    {
      label: 'Total Alerts Today',
      value: '23',
      icon: 'Bell',
      change: '+8',
      changeType: 'negative'
    },
    {
      label: 'Avg Response Time',
      value: '4.2m',
      icon: 'Clock',
      change: '-1.3m',
      changeType: 'positive'
    },
    {
      label: 'Compliance Rate',
      value: '94%',
      icon: 'CheckCircle',
      change: '+2%',
      changeType: 'positive'
    },
    {
      label: 'Data Coverage',
      value: '98%',
      icon: 'Activity',
      change: '+1%',
      changeType: 'positive'
    }
  ];

  const sensors = (readings || []).slice(0, 20).map((r, i) => ({
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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="LayoutDashboard" size={22} color="var(--color-primary)" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Environmental Dashboard</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Real-time environmental monitoring and analysis for smart city management
        </p>
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
                <span className="text-xs md:text-sm text-muted-foreground">API Status</span>
                <span className="text-xs md:text-sm text-success font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-muted-foreground">Database</span>
                <span className="text-xs md:text-sm text-success font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-muted-foreground">WebSocket</span>
                <span className="text-xs md:text-sm text-success font-medium">Active</span>
              </div>
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