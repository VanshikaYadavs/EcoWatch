import React from 'react';
import Icon from '../../../components/AppIcon';

const ComparativeAnalysis = ({ locations, onLocationSelect }) => {
  const getComparisonStatus = (diff) => {
    if (diff > 3) return { color: 'var(--color-error)', label: 'Much Warmer', icon: 'ArrowUp' };
    if (diff > 1) return { color: 'var(--color-warning)', label: 'Warmer', icon: 'ArrowUpRight' };
    if (diff < -3) return { color: 'var(--color-accent)', label: 'Much Cooler', icon: 'ArrowDown' };
    if (diff < -1) return { color: 'var(--color-success)', label: 'Cooler', icon: 'ArrowDownRight' };
    return { color: 'var(--color-muted-foreground)', label: 'Similar', icon: 'Minus' };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
          <Icon name="GitCompare" size={20} color="var(--color-secondary)" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Comparative Analysis</h3>
          <p className="caption text-muted-foreground">Temperature differences across zones</p>
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
                  <p className="caption text-muted-foreground mb-1">Current</p>
                  <p className="text-lg font-semibold text-foreground data-text">
                    {location?.current}°C
                  </p>
                </div>
                <div>
                  <p className="caption text-muted-foreground mb-1">Difference</p>
                  <p 
                    className="text-lg font-semibold data-text"
                    style={{ color: status?.color }}
                  >
                    {location?.difference > 0 ? '+' : ''}{location?.difference}°C
                  </p>
                </div>
                <div>
                  <p className="caption text-muted-foreground mb-1">24h Avg</p>
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