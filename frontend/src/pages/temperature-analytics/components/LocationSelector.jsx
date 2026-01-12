import React from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const LocationSelector = ({ 
  locations, 
  selectedLocation, 
  onLocationChange,
  showElevation = true 
}) => {
  const { t } = useTranslation();

  const locationOptions = locations?.map(loc => ({
    value: loc?.id,
    label: loc?.name,
    description: showElevation ? `${t('temp.location.elevationPrefix')} ${loc?.elevation}m • ${t('temp.location.zoneLabel')} ${loc?.zone}` : loc?.zone
  }));

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name="MapPin" size={20} color="var(--color-primary)" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t('temp.location.title')}</h3>
          <p className="caption text-muted-foreground">{t('temp.location.subtitle')}</p>
        </div>
      </div>
      <Select
        label={t('temp.location.label')}
        options={locationOptions}
        value={selectedLocation}
        onChange={onLocationChange}
        searchable
        placeholder={t('temp.location.placeholder')}
        className="mb-4"
      />
      {selectedLocation && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            {locations?.find(loc => loc?.id === selectedLocation) && (
              <>
                <div>
                  <p className="caption text-muted-foreground mb-1">{t('temp.location.coordinates')}</p>
                  <p className="text-sm font-medium text-foreground data-text">
                    {locations?.find(loc => loc?.id === selectedLocation)?.coordinates}
                  </p>
                </div>
                <div>
                  <p className="caption text-muted-foreground mb-1">{t('temp.location.climateType')}</p>
                  <p className="text-sm font-medium text-foreground">
                    {locations?.find(loc => loc?.id === selectedLocation)?.climateType}
                  </p>
                </div>
                <div>
                  <p className="caption text-muted-foreground mb-1">{t('temp.location.sensorsActive')}</p>
                  <p className="text-sm font-medium text-foreground data-text">
                    {locations?.find(loc => loc?.id === selectedLocation)?.sensorsActive}
                  </p>
                </div>
                <div>
                  <p className="caption text-muted-foreground mb-1">{t('temp.location.lastUpdate')}</p>
                  <p className="text-sm font-medium text-foreground">
                    {locations?.find(loc => loc?.id === selectedLocation)?.lastUpdate}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;