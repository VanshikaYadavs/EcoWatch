import React from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useLatestCityReadings } from '../../../utils/dataHooks';
import { getSessionAllowlist } from '../../../utils/sessionCities';

const CitySelector = ({ selectedCities, onCityToggle, maxSelections = 5 }) => {
  const [allowlist, setAllowlist] = React.useState([]);
  React.useEffect(() => { (async () => { try { setAllowlist(await getSessionAllowlist()); } catch {} })(); }, []);
  const { data: latestCityReadings } = useLatestCityReadings({ fallbackWindow: 150, allowLocations: allowlist });
  const cities = (latestCityReadings || []).map(r => ({
    id: (r.location || '').toLowerCase().replace(/\s+/g, '-'),
    name: r.location,
    region: 'Unknown',
    currentAQI: typeof r.aqi === 'number' ? r.aqi : null,
  }));

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
        Select up to {maxSelections} cities based on live data
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
                    {city?.region}
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