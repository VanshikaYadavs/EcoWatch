import React from 'react';
import Icon from '../../../components/AppIcon';

const HeatMapVisualization = ({ zones, onZoneClick }) => {
  const getTemperatureColor = (temp) => {
    if (temp >= 35) return 'bg-red-600';
    if (temp >= 30) return 'bg-orange-500';
    if (temp >= 25) return 'bg-yellow-500';
    if (temp >= 20) return 'bg-green-500';
    if (temp >= 15) return 'bg-blue-500';
    return 'bg-cyan-500';
  };

  const getTemperatureLabel = (temp) => {
    if (temp >= 35) return 'Extreme Heat';
    if (temp >= 30) return 'Very Hot';
    if (temp >= 25) return 'Hot';
    if (temp >= 20) return 'Warm';
    if (temp >= 15) return 'Moderate';
    return 'Cool';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
            <Icon name="Flame" size={20} color="var(--color-error)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Urban Heat Island Map</h3>
            <p className="caption text-muted-foreground">Real-time temperature distribution</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {zones?.map((zone) => (
          <button
            key={zone?.id}
            onClick={() => onZoneClick && onZoneClick(zone)}
            className={`
              ${getTemperatureColor(zone?.temperature)} 
              text-white rounded-lg p-4 transition-smooth hover:scale-105 focus-ring
              flex flex-col items-center justify-center min-h-[120px]
            `}
          >
            <Icon name="MapPin" size={20} className="mb-2" />
            <p className="font-medium text-sm mb-1">{zone?.name}</p>
            <p className="text-2xl font-bold data-text">{zone?.temperature}°C</p>
            <p className="text-xs opacity-90 mt-1">{getTemperatureLabel(zone?.temperature)}</p>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-cyan-500" />
          <span className="caption text-muted-foreground">&lt;15°C</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="caption text-muted-foreground">15-20°C</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="caption text-muted-foreground">20-25°C</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="caption text-muted-foreground">25-30°C</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500" />
          <span className="caption text-muted-foreground">30-35°C</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600" />
          <span className="caption text-muted-foreground">&gt;35°C</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMapVisualization;