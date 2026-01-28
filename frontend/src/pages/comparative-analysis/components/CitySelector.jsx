import React from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const CitySelector = ({ selectedCities, onCityToggle, maxSelections = 5 }) => {
  const { t } = useTranslation();
  const cities = [
    { id: 'jaipur', region: 'Central', currentAQI: 156 },
    { id: 'jodhpur', region: 'Western', currentAQI: 142 },
    { id: 'udaipur', region: 'Southern', currentAQI: 98 },
    { id: 'kota', region: 'Eastern', currentAQI: 178 },
    { id: 'ajmer', region: 'Central', currentAQI: 134 },
    { id: 'bikaner', region: 'Northern', currentAQI: 165 },
    { id: 'alwar', region: 'Eastern', currentAQI: 123 },
    { id: 'bharatpur', region: 'Eastern', currentAQI: 145 },
    { id: 'sikar', region: 'Northern', currentAQI: 112 },
    { id: 'pali', region: 'Western', currentAQI: 128 },
    { id: 'tonk', region: 'Central', currentAQI: 149 },
    { id: 'bhilwara', region: 'Southern', currentAQI: 118 }
  ];

  const cityName = (id) => t(`cities.${id}`, { defaultValue: id });

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
            {t('comp.selector.title')}
          </h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
          <span className="text-xs md:text-sm font-data text-primary font-medium">
            {t('comp.selector.counter', { count: selectedCities?.length || 0, max: maxSelections })}
          </span>
        </div>
      </div>
      <p className="text-xs md:text-sm text-muted-foreground mb-4">
        {t('comp.selector.helper', { max: maxSelections })}
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
                    {cityName(city?.id)}
                  </span>
                  <span className="text-xs font-caption text-muted-foreground">
                    {city?.region}
                    {t('comp.selector.region', { region: city?.region })}
>>>>>>> translation
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <span className={`text-xs font-data font-medium whitespace-nowrap ${getAQIColor(city?.currentAQI)}`}>
                  {t('comp.selector.aqiLabel', { value: city?.currentAQI })}
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
            {t('comp.selector.maxReached', { max: maxSelections })}
          </p>
        </div>
      )}
    </div>
  );
};

export default CitySelector;