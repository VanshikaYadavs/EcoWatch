import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const getAQICategory = (aqi) => {
  if (aqi <= 50) return { label: 'Good', color: 'text-green-600 bg-green-100', textColor: 'text-green-700' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-600 bg-yellow-100', textColor: 'text-yellow-700' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-orange-600 bg-orange-100', textColor: 'text-orange-700' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-600 bg-red-100', textColor: 'text-red-700' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-600 bg-purple-100', textColor: 'text-purple-700' };
  return { label: 'Hazardous', color: 'text-red-900 bg-red-200', textColor: 'text-red-900' };
};

const NearbyStations = ({ sensors = [], userLocation, loading, onRefresh }) => {
  const formatDistance = (distance) => {
    if (!distance && distance !== 0) return null;
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
    return `${distance.toFixed(1)}km`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1">
              Nearby Monitoring Stations
            </h2>
            <p className="text-sm text-muted-foreground">
              {userLocation 
                ? `Real-time AQI data from ${sensors.length} stations near your location`
                : `Showing ${sensors.length} monitoring stations across the region`
              }
            </p>
          </div>
          <Button
            variant="outline"
            iconName={loading ? 'Loader2' : 'RefreshCw'}
            iconPosition="left"
            onClick={onRefresh}
            disabled={loading}
            size="sm"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : sensors.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No monitoring stations found</p>
          <p className="text-sm">Try enabling location services or check back later</p>
        </div>
      ) : (
        <>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sensor, index) => {
            const aqiCategory = getAQICategory(sensor.aqi);
            const distance = sensor.distance ? formatDistance(sensor.distance) : null;
            
            return (
              <div
                key={sensor.id || index}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow bg-background"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-base truncate" title={sensor.location}>
                      {sensor.location}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(sensor.recorded_at)}
                    </p>
                  </div>
                  {distance && (
                    <div className="ml-2 flex-shrink-0">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        📍 {distance}
                      </span>
                    </div>
                  )}
                </div>

                {/* AQI Display */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-foreground">
                      {Math.round(sensor.aqi)}
                    </span>
                    <span className="text-sm text-muted-foreground">AQI</span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${aqiCategory.color}`}>
                    {aqiCategory.label}
                  </span>
                </div>

                {/* Environmental Data */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-background/50 rounded p-2 text-center">
                    <div className="text-muted-foreground mb-1">Temp</div>
                    <div className="font-semibold text-foreground">
                      {sensor.temperature ? `${Number(sensor.temperature).toFixed(1)}°C` : '—'}
                    </div>
                  </div>
                  <div className="bg-background/50 rounded p-2 text-center">
                    <div className="text-muted-foreground mb-1">Humidity</div>
                    <div className="font-semibold text-foreground">
                      {sensor.humidity ? `${Math.round(sensor.humidity)}%` : '—'}
                    </div>
                  </div>
                  <div className="bg-background/50 rounded p-2 text-center">
                    <div className="text-muted-foreground mb-1">Noise</div>
                    <div className="font-semibold text-foreground">
                      {sensor.noise ? `${Math.round(sensor.noise)}dB` : '—'}
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Status</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        sensor.status === 'good' ? 'bg-green-500' :
                        sensor.status === 'moderate' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className={`font-medium capitalize ${
                        sensor.status === 'good' ? 'text-green-600' :
                        sensor.status === 'moderate' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {sensor.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="p-4 md:p-6 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {sensors.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Stations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {sensors.filter(s => s.aqi <= 50).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Good Quality</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {sensors.filter(s => s.aqi > 50 && s.aqi <= 100).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Moderate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {sensors.filter(s => s.aqi > 100).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Unhealthy</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NearbyStations;
