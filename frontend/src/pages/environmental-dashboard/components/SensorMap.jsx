import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const SensorMap = ({ sensors, onSensorClick }) => {
  const [selectedSensor, setSelectedSensor] = useState(null);

  const handleSensorClick = (sensor) => {
    setSelectedSensor(sensor);
    if (onSensorClick) {
      onSensorClick(sensor);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      good: '#059669',
      moderate: '#D97706',
      poor: '#DC2626',
      critical: '#991B1B'
    };
    return colors?.[status] || colors?.good;
  };

  const { t } = useTranslation();

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold">{t('smap.title')}</h3>
        <div className="flex items-center gap-2">
          <span className="refresh-indicator live">
            <span className="refresh-indicator-pulse" />
            <span className="caption">{t('smap.live')}</span>
          </span>
        </div>
      </div>
      <div className="relative w-full h-64 md:h-80 lg:h-96 bg-muted rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Environmental Sensor Map"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=40.7128,-74.0060&z=12&output=embed"
          className="absolute inset-0"
        />

        <div className="absolute top-4 right-4 bg-card rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="MapPin" size={16} color="var(--color-primary)" />
            <span className="text-xs md:text-sm font-medium">{t('smap.active', { count: sensors?.length })}</span>
          </div>
          <div className="space-y-1">
            {['good', 'moderate', 'poor', 'critical']?.map(status => (
              <div key={status} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getStatusColor(status) }}
                />
                <span className="text-xs">{t(`smap.status.${status}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedSensor && (
        <div className="mt-4 p-3 md:p-4 bg-muted rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-sm md:text-base font-medium">{selectedSensor?.location}</h4>
              <p className="text-xs md:text-sm text-muted-foreground">{selectedSensor?.address}</p>
            </div>
            <button
              onClick={() => setSelectedSensor(null)}
              className="p-1 hover:bg-background rounded transition-smooth"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <span className="text-xs text-muted-foreground">{t('smap.label.aqi')}</span>
              <p className="text-sm md:text-base font-medium">{selectedSensor?.aqi}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">{t('smap.label.noise')}</span>
              <p className="text-sm md:text-base font-medium">{selectedSensor?.noise} dB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorMap;