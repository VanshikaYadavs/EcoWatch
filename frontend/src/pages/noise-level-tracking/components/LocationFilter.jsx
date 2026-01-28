import React from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import { useTranslation } from 'react-i18next';

const LocationFilter = ({ selectedLocation, onLocationChange, locations, customThresholds, onThresholdChange }) => {
  const { t } = useTranslation();

  const locationOptions = locations?.map(loc => ({
    value: loc?.id,
    label: loc?.name,
    description: loc?.type
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8 shadow-md">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Icon name="MapPin" size={24} color="var(--color-primary)" />
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
          {t('noise.location.title')}
        </h2>
      </div>
      <div className="space-y-4 md:space-y-6">
        <Select
          label={t('noise.location.select')}
          description={t('noise.location.select.desc')}
          options={locationOptions}
          value={selectedLocation}
          onChange={onLocationChange}
          searchable
          className="w-full"
        />

        {selectedLocation && (
          <div className="bg-muted rounded-lg p-4 md:p-6">
            <h3 className="text-base md:text-lg font-medium text-foreground mb-3 md:mb-4">
              {t('noise.location.details')}
            </h3>
            <div className="space-y-3">
              {locations?.find(loc => loc?.id === selectedLocation) && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('noise.location.zoneType')}:</span>
                    <span className="text-sm font-medium text-foreground">
                      {locations?.find(loc => loc?.id === selectedLocation)?.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('noise.location.activeSensors')}:</span>
                    <span className="text-sm font-medium text-foreground">
                      {locations?.find(loc => loc?.id === selectedLocation)?.sensors}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('noise.location.populationDensity')}:</span>
                    <span className="text-sm font-medium text-foreground">
                      {locations?.find(loc => loc?.id === selectedLocation)?.density}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="bg-primary/5 rounded-lg p-4 md:p-6 border border-primary/20">
          <h3 className="text-base md:text-lg font-medium text-foreground mb-3 md:mb-4">
            {t('noise.location.customThresholds')}
          </h3>
          <div className="space-y-3 md:space-y-4">
            <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                {t('noise.threshold.acceptable')}
              </label>
              <input
                type="number"
                value={customThresholds?.acceptable}
                onChange={(e) => onThresholdChange('acceptable', parseInt(e?.target?.value))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
                max="100"
              />
            </div>
            <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                {t('noise.threshold.concerning')}
              </label>
              <input
                type="number"
                value={customThresholds?.concerning}
                onChange={(e) => onThresholdChange('concerning', parseInt(e?.target?.value))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
                max="100"
              />
            </div>
            <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                {t('noise.threshold.harmful')}
              </label>
              <input
                type="number"
                value={customThresholds?.harmful}
                onChange={(e) => onThresholdChange('harmful', parseInt(e?.target?.value))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationFilter;