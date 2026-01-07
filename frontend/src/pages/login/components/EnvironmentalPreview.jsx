import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const EnvironmentalPreview = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeMetric, setActiveMetric] = useState(0);

  const environmentalMetrics = [
    {
      id: 1,
      icon: 'Wind',
      label: 'Air Quality Index',
      value: '42',
      unit: 'AQI',
      status: 'Good',
      statusColor: 'text-success',
      bgColor: 'bg-success/10',
      description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
      location: 'MI Road, Jaipur'
    },
    {
      id: 2,
      icon: 'Volume2',
      label: 'Noise Level',
      value: '58',
      unit: 'dB',
      status: 'Moderate',
      statusColor: 'text-warning',
      bgColor: 'bg-warning/10',
      description: 'Noise levels are within acceptable limits for urban areas.',
      location: 'Clock Tower, Jodhpur'
    },
    {
      id: 3,
      icon: 'Thermometer',
      label: 'Temperature',
      value: '22',
      unit: '°C',
      status: 'Optimal',
      statusColor: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'Temperature conditions are comfortable and within normal range.',
      location: 'Pushkar Road, Ajmer'
    },
    {
      id: 4,
      icon: 'Droplets',
      label: 'Humidity',
      value: '65',
      unit: '%',
      status: 'Normal',
      statusColor: 'text-accent',
      bgColor: 'bg-accent/10',
      description: 'Humidity levels are comfortable for most activities.',
      location: 'Lake Pichola, Udaipur'
    }
  ];

  const publicAnnouncements = [
    {
      id: 1,
      title: 'Environmental Monitoring Active',
      message: 'Real-time data collection from 247 sensors across the city.',
      icon: 'Activity',
      priority: 'info'
    },
    {
      id: 2,
      title: 'Air Quality Alert System',
      message: 'Automated notifications for threshold breaches and emergency situations.',
      icon: 'Bell',
      priority: 'info'
    },
    {
      id: 3,
      title: 'Community Health Initiative',
      message: 'Protecting public health through continuous environmental monitoring.',
      icon: 'Heart',
      priority: 'success'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % environmentalMetrics?.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const currentMetric = environmentalMetrics?.[activeMetric];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <Icon name="Activity" size={16} color="var(--color-primary)" />
          <span className="text-sm font-medium text-primary">Live Monitoring</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
          Environmental Data Preview
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Real-time insights from EchoWatch monitoring network
        </p>
      </div>
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${currentMetric?.bgColor}`}>
              <Icon name={currentMetric?.icon} size={24} color={`var(--color-${currentMetric?.statusColor?.replace('text-', '')})`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{currentMetric?.label}</p>
              <p className="text-xs text-muted-foreground">{currentMetric?.location}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full ${currentMetric?.bgColor}`}>
            <span className={`text-sm font-medium ${currentMetric?.statusColor}`}>
              {currentMetric?.status}
            </span>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl md:text-6xl font-bold text-foreground font-data">
              {currentMetric?.value}
            </span>
            <span className="text-2xl md:text-3xl text-muted-foreground font-data">
              {currentMetric?.unit}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {currentMetric?.description}
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {environmentalMetrics?.map((metric, index) => (
            <button
              key={metric?.id}
              onClick={() => setActiveMetric(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeMetric ? 'bg-primary w-8' : 'bg-muted'
              }`}
              aria-label={`View ${metric?.label}`}
            />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Info" size={20} color="var(--color-primary)" />
          Public Announcements
        </h3>
        {publicAnnouncements?.map((announcement) => (
          <div
            key={announcement?.id}
            className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-smooth"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Icon name={announcement?.icon} size={20} color="var(--color-primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {announcement?.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {announcement?.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-muted rounded-lg p-4 text-center space-y-2">
        <p className="text-sm text-muted-foreground">Current Time</p>
        <p className="text-2xl md:text-3xl font-bold text-foreground font-data">
          {formatTime(currentTime)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(currentTime)}
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Icon name="Shield" size={14} />
        <span>Secure Government Portal</span>
        <span>•</span>
        <span>SSL Encrypted</span>
      </div>
    </div>
  );
};

export default EnvironmentalPreview;