import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const ComparativeAnalysis = ({ locations, onLocationSelect }) => {
  const { t } = useTranslation();

  const getComparisonStatus = (diff) => {
    if (diff > 3) return { color: 'var(--color-error)', label: t('temp.comparative.muchWarmer'), icon: 'ArrowUp' };
    if (diff > 1) return { color: 'var(--color-warning)', label: t('temp.comparative.warmer'), icon: 'ArrowUpRight' };
    if (diff < -3) return { color: 'var(--color-accent)', label: t('temp.comparative.muchCooler'), icon: 'ArrowDown' };
    if (diff < -1) return { color: 'var(--color-success)', label: t('temp.comparative.cooler'), icon: 'ArrowDownRight' };
    return { color: 'var(--color-muted-foreground)', label: t('temp.comparative.similar'), icon: 'Minus' };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
          <Icon name="GitCompare" size={20} color="var(--color-secondary)" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t('temp.comparative.title')}</h3>
          <p className="caption text-muted-foreground">{t('temp.comparative.subtitle')}</p>
        </div>
      </div>
      <div className="space-y-3">
        {locations?.map((location) => {
          const status = getComparisonStatus(location?.difference);
          return (
            <button
              key={location?.id}
              onClick={() => onLocationSelect && onLocationSelect(location)}
              className="w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-smooth focus-ring text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Icon name="MapPin" size={16} color="var(--color-foreground)" />
                  <span className="font-medium text-foreground">{location?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name={status?.icon} size={16} color={status?.color} />
                  <span className="caption font-medium" style={{ color: status?.color }}>
                    {status?.label}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="caption text-muted-foreground mb-1">{t('temp.comparative.current')}</p>
                  <p className="text-lg font-semibold text-foreground data-text">
                    {location?.current}°C
                  </p>
                </div>
                <div>
                  <p className="caption text-muted-foreground mb-1">{t('temp.comparative.difference')}</p>
                  <p 
                    className="text-lg font-semibold data-text"
                    style={{ color: status?.color }}
                  >
                    {location?.difference > 0 ? '+' : ''}{location?.difference}°C
                  </p>
                </div>
                <div>
                  <p className="caption text-muted-foreground mb-1">{t('temp.comparative.avg24h')}</p>
                  <p className="text-lg font-semibold text-foreground data-text">
                    {location?.average24h}°C
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ComparativeAnalysis;