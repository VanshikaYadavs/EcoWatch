import React from 'react';
import { Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const AQIChart = ({ data, timeRange, selectedPollutants }) => {
  const { t } = useTranslation();

  const aqiCategories = [
    { name: t('aq.legend.good'), max: 50, color: '#10B981' },
    { name: t('aq.legend.moderate'), max: 100, color: '#F59E0B' },
    { name: t('aq.legend.unhealthySensitive'), max: 150, color: '#F97316' },
    { name: t('aq.legend.unhealthy'), max: 200, color: '#EF4444' },
    { name: t('aq.legend.veryUnhealthy'), max: 300, color: '#9333EA' },
    { name: t('aq.legend.hazardous'), max: 500, color: '#7C2D12' }
  ];

  const getAQIColor = (value) => {
    for (const category of aqiCategories) {
      if (value <= category?.max) return category?.color;
    }
    return '#7C2D12';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              />
              <span className="text-muted-foreground">{entry?.name}:</span>
              <span className="font-medium text-foreground">{entry?.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">{t('aq.trend.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('aq.trend.desc', { timeRange })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {aqiCategories?.slice(0, 4)?.map((category) => (
            <div key={category?.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: category?.color }}
              />
              <span className="text-xs text-muted-foreground">{category?.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full h-64 md:h-80 lg:h-96" aria-label={t('aq.trend.title')}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="time" 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
              label={{ value: t('aq.series.overall'), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Area 
              type="monotone" 
              dataKey="aqi" 
              stroke="var(--color-primary)" 
              strokeWidth={2}
              fill="url(#aqiGradient)" 
              name={t('aq.series.overall')}
            />
            {selectedPollutants?.includes('pm25') && (
              <Line 
                type="monotone" 
                dataKey="pm25" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={false}
                name={t('aq.series.pm25')}
              />
            )}
            {selectedPollutants?.includes('pm10') && (
              <Line 
                type="monotone" 
                dataKey="pm10" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={false}
                name={t('aq.series.pm10')}
              />
            )}
            {selectedPollutants?.includes('ozone') && (
              <Line 
                type="monotone" 
                dataKey="ozone" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={false}
                name={t('aq.series.ozone')}
              />
            )}
            {selectedPollutants?.includes('no2') && (
              <Line 
                type="monotone" 
                dataKey="no2" 
                stroke="#9333EA" 
                strokeWidth={2}
                dot={false}
                name={t('aq.series.no2')}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">{t('aq.stats.current')}</p>
          <p className="text-2xl font-bold" style={{ color: getAQIColor(data?.[data?.length - 1]?.aqi || 0) }}>
            {data?.[data?.length - 1]?.aqi || 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">{t('aq.stats.avg24h')}</p>
          <p className="text-2xl font-bold text-foreground">
            {Math.round(data?.reduce((sum, d) => sum + d?.aqi, 0) / (data?.length || 1))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">{t('aq.stats.peak')}</p>
          <p className="text-2xl font-bold text-error">
            {Math.max(...(data?.map(d => d?.aqi) || [0]))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">{t('aq.stats.lowest')}</p>
          <p className="text-2xl font-bold text-success">
            {Math.min(...(data?.map(d => d?.aqi) || [0]))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AQIChart;