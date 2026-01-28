import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const FrequencyAnalysisChart = ({ data }) => {
  const { t } = useTranslation();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">
            {payload?.[0]?.payload?.source}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('noise.frequency.tooltip.frequency')}: {payload?.[0]?.value} Hz
          </p>
          <p className="text-xs text-muted-foreground">
            {t('noise.frequency.tooltip.intensity')}: {payload?.[1]?.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8 shadow-md">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Icon name="Radio" size={24} color="var(--color-accent)" />
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
          {t('noise.frequency.title')}
        </h2>
      </div>
      <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
        {t('noise.frequency.subtitle')}
      </p>
      <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Frequency Analysis Bar Chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
            <XAxis 
              dataKey="source" 
              stroke="var(--color-muted-foreground)"
              tick={{ fontSize: 12 }}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              tick={{ fontSize: 12 }}
              tickMargin={8}
              label={{ value: t('noise.frequency.yaxis'), angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'var(--color-muted-foreground)' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Bar 
              dataKey="frequency" 
              fill="var(--color-accent)" 
              radius={[8, 8, 0, 0]}
              name={t('noise.frequency.series.frequency')}
            />
            <Bar 
              dataKey="intensity" 
              fill="var(--color-secondary)" 
              radius={[8, 8, 0, 0]}
              name={t('noise.frequency.series.intensity')}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-muted rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Car" size={16} color="var(--color-primary)" />
              <span className="text-xs md:text-sm text-muted-foreground">{t('noise.sources.traffic')}</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-foreground">
              {data?.filter(d => d?.source?.includes('Traffic'))?.reduce((sum, d) => sum + d?.intensity, 0)}%
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="HardHat" size={16} color="var(--color-warning)" />
              <span className="text-xs md:text-sm text-muted-foreground">{t('noise.sources.construction')}</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-foreground">
              {data?.filter(d => d?.source?.includes('Construction'))?.reduce((sum, d) => sum + d?.intensity, 0)}%
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Factory" size={16} color="var(--color-error)" />
              <span className="text-xs md:text-sm text-muted-foreground">{t('noise.sources.industrial')}</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-foreground">
              {data?.filter(d => d?.source?.includes('Industrial'))?.reduce((sum, d) => sum + d?.intensity, 0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrequencyAnalysisChart;