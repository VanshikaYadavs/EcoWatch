import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const RealtimeNoiseMeter = ({ currentLevel, peakLevel, averageLevel, status }) => {
  const { t } = useTranslation();
  const getStatusColor = (level) => {
    if (level < 55) return 'text-success';
    if (level < 70) return 'text-warning';
    return 'text-error';
  };

  const getStatusBg = (level) => {
    if (level < 55) return 'bg-success/10';
    if (level < 70) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getStatusLabel = (level) => {
    if (level < 55) return t('noise.status.acceptable');
    if (level < 70) return t('noise.status.concerning');
    return t('noise.status.harmful');
  };

  const getMeterRotation = (level) => {
    const minAngle = -90;
    const maxAngle = 90;
    const percentage = Math.min(Math.max(level, 0), 100) / 100;
    return minAngle + (percentage * (maxAngle - minAngle));
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8 shadow-md">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
          {t('noise.realtime.title')}
        </h2>
        <div className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full ${getStatusBg(currentLevel)}`}>
          <span className={`text-xs md:text-sm font-medium ${getStatusColor(currentLevel)}`}>
            {getStatusLabel(currentLevel)}
          </span>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        <div className="relative w-full max-w-xs lg:max-w-sm aspect-square flex items-center justify-center">
          <svg viewBox="0 0 200 120" className="w-full h-auto">
            <defs>
              <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-success)" />
                <stop offset="50%" stopColor="var(--color-warning)" />
                <stop offset="100%" stopColor="var(--color-error)" />
              </linearGradient>
            </defs>
            
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#meterGradient)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.2"
            />
            
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke="var(--color-foreground)"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${getMeterRotation(currentLevel)} 100 100)`}
              style={{ transition: 'transform 0.5s ease-out' }}
            />
            
            <circle cx="100" cy="100" r="8" fill="var(--color-foreground)" />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center mt-8 md:mt-12">
            <div className={`text-4xl md:text-5xl lg:text-6xl font-bold ${getStatusColor(currentLevel)}`}>
              {currentLevel}
            </div>
            <div className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
              dB
            </div>
          </div>
        </div>

        <div className="flex-1 w-full grid grid-cols-2 gap-4 md:gap-6">
          <div className="bg-muted rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <Icon name="TrendingUp" size={18} color="var(--color-error)" />
              <span className="text-xs md:text-sm text-muted-foreground">{t('noise.realtime.peak')}</span>
            </div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              {peakLevel}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">
              {t('noise.unit.db')}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <Icon name="Activity" size={18} color="var(--color-primary)" />
              <span className="text-xs md:text-sm text-muted-foreground">{t('noise.realtime.average')}</span>
            </div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              {averageLevel}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">
              {t('noise.unit.db')}
            </div>
          </div>

          <div className="col-span-2 bg-primary/5 rounded-lg p-4 md:p-6 border border-primary/20">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-sm md:text-base font-medium text-foreground mb-1">
                  {t('noise.guidelines.title')}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {t('noise.guidelines.summary')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
        <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
          <span>{t('noise.lastUpdated', { time: new Date()?.toLocaleTimeString() })}</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            {t('noise.live')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RealtimeNoiseMeter;