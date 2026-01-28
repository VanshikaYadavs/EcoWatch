import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const ComparativeAnalysis = ({ zones }) => {
  const { t } = useTranslation();
  const getComparisonColor = (value, avg) => {
    const diff = ((value - avg) / avg) * 100;
    if (diff > 10) return 'text-error';
    if (diff > 0) return 'text-warning';
    return 'text-success';
  };

  const getComparisonIcon = (value, avg) => {
    if (value > avg) return 'TrendingUp';
    if (value < avg) return 'TrendingDown';
    return 'Minus';
  };

  const averageLevel = zones?.reduce((sum, zone) => sum + zone?.currentLevel, 0) / zones?.length;

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8 shadow-md">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Icon name="BarChart3" size={24} color="var(--color-secondary)" />
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
          {t('noise.comparative.title')}
        </h2>
      </div>
      <div className="bg-primary/5 rounded-lg p-4 md:p-6 border border-primary/20 mb-4 md:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">{t('noise.comparative.cityAverage')}</div>
            <div className="text-2xl md:text-3xl font-bold text-foreground">
              {averageLevel?.toFixed(1)} {t('noise.unit.db')}
            </div>
          </div>
          <Icon name="Activity" size={32} color="var(--color-primary)" />
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        {zones?.map((zone) => (
          <div key={zone?.id} className="bg-muted rounded-lg p-4 md:p-6 hover:shadow-md transition-smooth">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-medium text-foreground mb-1">
                  {zone?.name}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {zone?.type} • {zone?.sensors} {t('noise.zones.sensors')}
                </p>
              </div>
              <div className={`flex items-center gap-2 ${getComparisonColor(zone?.currentLevel, averageLevel)}`}>
                <Icon 
                  name={getComparisonIcon(zone?.currentLevel, averageLevel)} 
                  size={20}
                />
                <span className="text-sm font-medium whitespace-nowrap">
                  {Math.abs(((zone?.currentLevel - averageLevel) / averageLevel) * 100)?.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">{t('noise.comparative.current')}</div>
                <div className="text-lg md:text-xl font-bold text-foreground">
                  {zone?.currentLevel} {t('noise.unit.db')}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">{t('noise.comparative.peak')}</div>
                <div className="text-lg md:text-xl font-bold text-foreground">
                  {zone?.peakLevel} {t('noise.unit.db')}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">{t('noise.comparative.average')}</div>
                <div className="text-lg md:text-xl font-bold text-foreground">
                  {zone?.averageLevel} {t('noise.unit.db')}
                </div>
              </div>
              <div>
                <div className="text-xs md:text-sm text-muted-foreground mb-1">{t('noise.comparative.trend')}</div>
                <div className={`text-lg md:text-xl font-bold ${zone?.trend > 0 ? 'text-error' : 'text-success'}`}>
                  {zone?.trend > 0 ? '+' : ''}{zone?.trend}%
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">{t('noise.comparative.complianceStatus')}:</span>
                <span className={`font-medium ${zone?.compliant ? 'text-success' : 'text-error'}`}>
                  {zone?.compliant ? t('noise.comparative.withinLimits') : t('noise.comparative.exceeds')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="text-center p-3 md:p-4 bg-success/10 rounded-lg">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">{t('noise.comparative.compliantZones')}</div>
            <div className="text-xl md:text-2xl font-bold text-success">
              {zones?.filter(z => z?.compliant)?.length}/{zones?.length}
            </div>
          </div>
          <div className="text-center p-3 md:p-4 bg-warning/10 rounded-lg">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">{t('noise.comparative.highestLevel')}</div>
            <div className="text-xl md:text-2xl font-bold text-warning">
              {Math.max(...zones?.map(z => z?.currentLevel))} {t('noise.unit.db')}
            </div>
          </div>
          <div className="text-center p-3 md:p-4 bg-primary/10 rounded-lg">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">{t('noise.comparative.totalSensors')}</div>
            <div className="text-xl md:text-2xl font-bold text-primary">
              {zones?.reduce((sum, z) => sum + z?.sensors, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparativeAnalysis;