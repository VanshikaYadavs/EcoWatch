import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const TrendChart = ({ title, data, parameter, chartType = 'line' }) => {
  const getParameterConfig = () => {
    const configs = {
      aqi: {
        color: '#DC2626',
        label: 'AQI Value',
        unit: 'AQI',
        icon: 'Wind'
      },
      noise: {
        color: '#D97706',
        label: 'Noise Level',
        unit: 'dB',
        icon: 'Volume2'
      },
      temperature: {
        color: '#059669',
        label: 'Temperature',
        unit: '°F',
        icon: 'Thermometer'
      },
      humidity: {
        color: '#3B82F6',
        label: 'Humidity',
        unit: '%',
        icon: 'Droplets'
      }
    };
    return configs?.[parameter] || configs?.aqi;
  };

  const config = getParameterConfig();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{payload?.[0]?.payload?.date}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {config?.label}: <span className="font-semibold" style={{ color: config?.color }}>
              {payload?.[0]?.value} {config?.unit}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${parameter}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config?.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config?.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
            <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke={config?.color} fill={`url(#gradient-${parameter})`} strokeWidth={2} />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
            <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={config?.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
            <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="value" stroke={config?.color} strokeWidth={2} dot={{ fill: config?.color, r: 4 }} />
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config?.color}20` }}>
            <Icon name={config?.icon} size={20} color={config?.color} />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{config?.label} Trends</p>
          </div>
        </div>
      </div>
      <div className="w-full h-64 md:h-80" aria-label={`${title} trend chart`}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;