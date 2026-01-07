import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SensorDataTable = ({ sensors, onLocationClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'aqi', direction: 'desc' });

  const getAQICategory = (aqi) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-success bg-success/10' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-warning bg-warning/10' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-orange-600 bg-orange-600/10' };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'text-error bg-error/10' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-600 bg-purple-600/10' };
    return { label: 'Hazardous', color: 'text-red-900 bg-red-900/10' };
  };

  const getHealthImpact = (aqi) => {
    if (aqi <= 50) return "Air quality is satisfactory, and air pollution poses little or no risk.";
    if (aqi <= 100) return "Air quality is acceptable. However, there may be a risk for some people.";
    if (aqi <= 150) return "Members of sensitive groups may experience health effects.";
    if (aqi <= 200) return "Some members of the general public may experience health effects.";
    if (aqi <= 300) return "Health alert: The risk of health effects is increased for everyone.";
    return "Health warning of emergency conditions: everyone is more likely to be affected.";
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const sortedSensors = [...sensors]?.sort((a, b) => {
    if (sortConfig?.direction === 'asc') {
      return a?.[sortConfig?.key] > b?.[sortConfig?.key] ? 1 : -1;
    }
    return a?.[sortConfig?.key] < b?.[sortConfig?.key] ? 1 : -1;
  });

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">Sensor Locations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Current readings from {sensors?.length} monitoring stations
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left">
                <button 
                  onClick={() => handleSort('location')}
                  className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Location
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button 
                  onClick={() => handleSort('aqi')}
                  className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  AQI
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left hidden md:table-cell">
                <span className="text-xs font-medium text-muted-foreground">Category</span>
              </th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">
                <span className="text-xs font-medium text-muted-foreground">PM2.5</span>
              </th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">
                <span className="text-xs font-medium text-muted-foreground">PM10</span>
              </th>
              <th className="px-4 py-3 text-left hidden xl:table-cell">
                <span className="text-xs font-medium text-muted-foreground">Ozone</span>
              </th>
              <th className="px-4 py-3 text-left hidden xl:table-cell">
                <span className="text-xs font-medium text-muted-foreground">NO₂</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-muted-foreground">Updated</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-muted-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedSensors?.map((sensor) => {
              const category = getAQICategory(sensor?.aqi);
              return (
                <tr key={sensor?.id} className="hover:bg-muted/50 transition-smooth">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Icon name="MapPin" size={16} color="var(--color-primary)" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{sensor?.location}</p>
                        <p className="text-xs text-muted-foreground">{sensor?.zone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-lg font-bold data-text" style={{ color: category?.color?.split(' ')?.[0]?.replace('text-', 'var(--color-') + ')' }}>
                      {sensor?.aqi}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${category?.color}`}>
                      {category?.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-sm data-text text-foreground">{sensor?.pm25} µg/m³</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-sm data-text text-foreground">{sensor?.pm10} µg/m³</span>
                  </td>
                  <td className="px-4 py-4 hidden xl:table-cell">
                    <span className="text-sm data-text text-foreground">{sensor?.ozone} ppb</span>
                  </td>
                  <td className="px-4 py-4 hidden xl:table-cell">
                    <span className="text-sm data-text text-foreground">{sensor?.no2} ppb</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{sensor?.lastUpdate}</span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onLocationClick(sensor)}
                      className="touch-target p-2 rounded-lg hover:bg-muted transition-smooth focus-ring"
                      aria-label={`View details for ${sensor?.location}`}
                      title="View location details"
                    >
                      <Icon name="ExternalLink" size={16} color="var(--color-primary)" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {sensors?.length} monitoring stations
          </p>
          <div className="flex items-center gap-2">
            <Icon name="Info" size={16} color="var(--color-muted-foreground)" />
            <p className="text-xs text-muted-foreground">
              Data updates every minute via WebSocket connection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorDataTable;