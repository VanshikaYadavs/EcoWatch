import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from './components/MetricCard';
import SensorMap from './components/SensorMap';
import FilterControls from './components/FilterControls';
import HotspotAlert from './components/HotspotAlert';
import QuickStats from './components/QuickStats';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const EnvironmentalDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('realtime');
  const [location, setLocation] = useState('all');
  const [parameter, setParameter] = useState('all');

  const metrics = [
    {
      title: 'Air Quality Index',
      value: '156',
      unit: 'AQI',
      status: 'poor',
      trend: 'up',
      trendValue: '+12%',
      icon: 'Wind',
      threshold: '150',
      onClick: () => navigate('/air-quality-monitor')
    },
    {
      title: 'Noise Level',
      value: '78',
      unit: 'dB',
      status: 'moderate',
      trend: 'down',
      trendValue: '-5%',
      icon: 'Volume2',
      threshold: '85',
      onClick: () => navigate('/noise-level-tracking')
    },
    {
      title: 'Temperature',
      value: '28',
      unit: '°C',
      status: 'good',
      trend: 'up',
      trendValue: '+2°C',
      icon: 'Thermometer',
      threshold: '35',
      onClick: () => navigate('/temperature-analytics')
    },
    {
      title: 'Humidity',
      value: '65',
      unit: '%',
      status: 'good',
      trend: 'down',
      trendValue: '-3%',
      icon: 'Droplets',
      threshold: '80',
      onClick: () => {}
    },
    {
      title: 'Active Hotspots',
      value: '3',
      unit: 'zones',
      status: 'critical',
      trend: 'up',
      trendValue: '+2',
      icon: 'MapPin',
      threshold: '5',
      onClick: () => {}
    },
    {
      title: 'Active Sensors',
      value: '47',
      unit: 'online',
      status: 'good',
      trend: 'up',
      trendValue: '+1',
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

  const sensors = [
    {
      id: 1,
      location: 'MI Road, Jaipur',
      address: 'MI Road, Jaipur, Rajasthan',
      aqi: 156,
      noise: 78,
      status: 'poor',
      lat: 40.7128,
      lng: -74.0060
    },
    {
      id: 2,
      location: 'Industrial Area, Tonk',
      address: 'Industrial Area, Tonk, Rajasthan',
      aqi: 189,
      noise: 92,
      status: 'critical',
      lat: 40.7200,
      lng: -74.0100
    },
    {
      id: 3,
      location: 'Lake Pichola, Udaipur',
      address: 'Lake Pichola, Udaipur, Rajasthan',
      aqi: 45,
      noise: 52,
      status: 'good',
      lat: 40.7050,
      lng: -74.0020
    }
  ];

  const hotspots = [
    {
      id: 1,
      severity: 'critical',
      title: 'Severe Air Pollution Detected',
      location: 'MI Road, Jaipur - Sensor #12',
      description: 'AQI levels have exceeded critical threshold. Immediate action recommended for sensitive groups.',
      aqi: 312,
      noise: 85,
      temperature: 32,
      time: '2 mins ago'
    },
    {
      id: 2,
      severity: 'high',
      title: 'Elevated Noise Levels',
      location: 'Clock Tower, Jodhpur - Sensor #08',
      description: 'Continuous noise exposure above 90dB detected. Construction activity ongoing.',
      aqi: 145,
      noise: 94,
      temperature: 29,
      time: '15 mins ago'
    },
    {
      id: 3,
      severity: 'medium',
      title: 'Temperature Spike Alert',
      location: 'Pushkar Road, Ajmer - Sensor #23',
      description: 'Unusual temperature increase detected. Heat island effect monitoring active.',
      aqi: 78,
      noise: 68,
      temperature: 35,
      time: '1 hour ago'
    }
  ];

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