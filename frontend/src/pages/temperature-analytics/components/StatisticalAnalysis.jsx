import React from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const StatisticalAnalysis = ({ data, period = 'monthly' }) => {
  const { t } = useTranslation();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="caption font-medium text-foreground mb-2">{label}</p>
          <p className="caption text-muted-foreground">
            {t('temp.stats.average')}: <span className="font-medium text-foreground">{payload?.[0]?.value}°C</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon name="BarChart3" size={20} color="var(--color-accent)" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t('temp.stats.title')}</h3>
          <p className="caption text-muted-foreground">{t('temp.stats.subtitle')}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-muted rounded-lg">
          <p className="caption text-muted-foreground mb-1">{t('temp.stats.mean')}</p>
          <p className="text-xl font-semibold text-foreground data-text">
            {data?.statistics?.mean}°C
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="caption text-muted-foreground mb-1">{t('temp.stats.median')}</p>
          <p className="text-xl font-semibold text-foreground data-text">
            {data?.statistics?.median}°C
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="caption text-muted-foreground mb-1">{t('temp.stats.stdDev')}</p>
          <p className="text-xl font-semibold text-foreground data-text">
            ±{data?.statistics?.stdDev}°C
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="caption text-muted-foreground mb-1">{t('temp.stats.range')}</p>
          <p className="text-xl font-semibold text-foreground data-text">
            {data?.statistics?.range}°C
          </p>
        </div>
      </div>
      <div className="w-full h-64 md:h-80" aria-label="Temperature distribution chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data?.distribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px', fontFamily: 'var(--font-caption)' }}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px', fontFamily: 'var(--font-caption)' }}
              label={{ value: 'Avg Temp (°C)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="average" 
              fill="var(--color-primary)" 
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="TrendingUp" size={20} color="var(--color-success)" />
          <div>
            <p className="text-sm font-medium text-foreground">{t('temp.climate.title')}</p>
            <p className="caption text-muted-foreground">
              {t('temp.climate.description', { increase: `+${data?.climateChange?.increase}°C`, years: data?.climateChange?.years })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticalAnalysis;