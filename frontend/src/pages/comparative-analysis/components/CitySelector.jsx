import React from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const CitySelector = ({ selectedCities, onCityToggle, maxSelections = 5 }) => {
  const cities = [
    { id: 'jaipur', name: 'Jaipur', region: 'Central', currentAQI: 156 },
    { id: 'jodhpur', name: 'Jodhpur', region: 'Western', currentAQI: 142 },
    { id: 'udaipur', name: 'Udaipur', region: 'Southern', currentAQI: 98 },
    { id: 'kota', name: 'Kota', region: 'Eastern', currentAQI: 178 },
    { id: 'ajmer', name: 'Ajmer', region: 'Central', currentAQI: 134 },
    { id: 'bikaner', name: 'Bikaner', region: 'Northern', currentAQI: 165 },
    { id: 'alwar', name: 'Alwar', region: 'Eastern', currentAQI: 123 },
    { id: 'bharatpur', name: 'Bharatpur', region: 'Eastern', currentAQI: 145 },
    { id: 'sikar', name: 'Sikar', region: 'Northern', currentAQI: 112 },
    { id: 'pali', name: 'Pali', region: 'Western', currentAQI: 128 },
    { id: 'tonk', name: 'Tonk', region: 'Central', currentAQI: 149 },
    { id: 'bhilwara', name: 'Bhilwara', region: 'Southern', currentAQI: 118 }
  ];

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'text-success';
    if (aqi <= 100) return 'text-warning';
    return 'text-error';
  };

  const isMaxReached = selectedCities?.length >= maxSelections;

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="MapPin" size={20} color="var(--color-primary)" />
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Select Cities to Compare
          </h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
          <span className="text-xs md:text-sm font-data text-primary font-medium">
            {selectedCities?.length}/{maxSelections}
          </span>
        </div>
      </div>
      <p className="text-xs md:text-sm text-muted-foreground mb-4">
        Select up to {maxSelections} cities for comprehensive environmental comparison
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cities?.map((city) => {
          const isSelected = selectedCities?.includes(city?.id);
          const isDisabled = !isSelected && isMaxReached;

          return (
            <div
              key={city?.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-250 ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : isDisabled
                  ? 'border-border bg-muted/50 opacity-50' :'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Checkbox
                  checked={isSelected}
                  onChange={() => onCityToggle(city?.id)}
                  disabled={isDisabled}
                  size="default"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">
                    {city?.name}
                  </span>
                  <span className="text-xs font-caption text-muted-foreground">
                    {city?.region} Rajasthan
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <span className={`text-xs font-data font-medium whitespace-nowrap ${getAQIColor(city?.currentAQI)}`}>
                  AQI {city?.currentAQI}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {isMaxReached && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <Icon name="AlertCircle" size={16} color="var(--color-warning)" />
          <p className="text-xs md:text-sm text-warning">
            Maximum {maxSelections} cities selected. Deselect a city to choose another.
          </p>
        </div>
      )}
    </div>
  );
};

export default CitySelector;