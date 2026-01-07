import React from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const LocationSelector = ({ 
  locations, 
  selectedLocation, 
  onLocationChange,
  showElevation = true 
}) => {
  const locationOptions = locations?.map(loc => ({
    value: loc?.id,
    label: loc?.name,
    description: showElevation ? `Elevation: ${loc?.elevation}m | Zone: ${loc?.zone}` : loc?.zone
  }));

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name="MapPin" size={20} color="var(--color-primary)" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Monitoring Location</h3>
          <p className="caption text-muted-foreground">Select zone for temperature analysis</p>
        </div>
      </div>
      <Select
        label="Location"
        options={locationOptions}
        value={selectedLocation}
        onChange={onLocationChange}
        searchable
        placeholder="Choose monitoring zone"
        className="mb-4"
      />
      {selectedLocation && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            {locations?.find(loc => loc?.id === selectedLocation) && (
              <>
                <div>
                  <p className="caption text-muted-foreground mb-1">Coordinates</p>
                  <p className="text-sm font-medium text-foreground data-text">
                    {locations?.find(loc => loc?.id === selectedLocation)?.coordinates}
                  </p>
                </div>
                <div>
                  <p className="caption text-muted-foreground mb-1">Climate Type</p>
                  <p className="text-sm font-medium text-foreground">
                    {locations?.find(loc => loc?.id === selectedLocation)?.climateType}
                  </p>
                </div>
                <div>
                  <p className="caption text-muted-foreground mb-1">Sensors Active</p>
                  <p className="text-sm font-medium text-foreground data-text">
                    {locations?.find(loc => loc?.id === selectedLocation)?.sensorsActive}
                  </p>
                </div>
                <div>
                  <p className="caption text-muted-foreground mb-1">Last Update</p>
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