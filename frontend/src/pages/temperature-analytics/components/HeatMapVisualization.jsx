import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const HeatMapVisualization = ({ zones, onZoneClick }) => {
  const { t } = useTranslation();
  const getTemperatureColor = (temp) => {
    if (temp >= 35) return 'bg-red-600';
    if (temp >= 30) return 'bg-orange-500';
    if (temp >= 25) return 'bg-yellow-500';
    if (temp >= 20) return 'bg-green-500';
    if (temp >= 15) return 'bg-blue-500';
    return 'bg-cyan-500';
  };

  const getTemperatureLabel = (temp) => {
    if (temp >= 35) return t('temp.heatmap.label.extreme');
    if (temp >= 30) return t('temp.heatmap.label.veryHot');
    if (temp >= 25) return t('temp.heatmap.label.hot');
    if (temp >= 20) return t('temp.heatmap.label.warm');
    if (temp >= 15) return t('temp.heatmap.label.moderate');
    return t('temp.heatmap.label.cool');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
            <Icon name="Flame" size={20} color="var(--color-error)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('temp.heatmap.title')}</h3>
            <p className="caption text-muted-foreground">{t('temp.heatmap.subtitle')}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {zones?.map((zone) => (
          <button
            key={zone?.id}
            onClick={() => onZoneClick && onZoneClick(zone)}
            className={`
              ${getTemperatureColor(zone?.temperature)} 
              text-white rounded-lg p-4 transition-smooth hover:scale-105 focus-ring
              flex flex-col items-center justify-center min-h-[120px]
            `}
          >
            <Icon name="MapPin" size={20} className="mb-2" />
            <p className="font-medium text-sm mb-1">{zone?.name}</p>
            <p className="text-2xl font-bold data-text">{zone?.temperature}°C</p>
            <p className="text-xs opacity-90 mt-1">{getTemperatureLabel(zone?.temperature)}</p>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-cyan-500" />
          <span className="caption text-muted-foreground">{t('temp.heatmap.legend.lt15')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="caption text-muted-foreground">{t('temp.heatmap.legend.15_20')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="caption text-muted-foreground">{t('temp.heatmap.legend.20_25')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="caption text-muted-foreground">{t('temp.heatmap.legend.25_30')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500" />
          <span className="caption text-muted-foreground">{t('temp.heatmap.legend.30_35')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600" />
          <span className="caption text-muted-foreground">{t('temp.heatmap.legend.gt35')}</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMapVisualization;