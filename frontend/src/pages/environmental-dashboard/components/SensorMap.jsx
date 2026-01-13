import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const SensorMap = ({ sensors, onSensorClick, userLocation = null }) => {
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 26.9124, lng: 75.7873 }); // Default: Jaipur
  const [mapZoom, setMapZoom] = useState(12);

  // Update map center when user location changes
  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lon) {
      const lat = parseFloat(userLocation.lat);
      const lng = parseFloat(userLocation.lon);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter({ lat, lng });
        setMapZoom(14); // Zoom in closer for user location
        console.log(`🗺️ Map centered on GPS location: (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
      }
    } else if (sensors && sensors.length > 0) {
      // Center on first sensor if no user location
      const firstSensor = sensors[0];
      if (firstSensor.lat && firstSensor.lng) {
        setMapCenter({ lat: firstSensor.lat, lng: firstSensor.lng });
        setMapZoom(10);
      }
    }
  }, [userLocation, sensors]);

  // Generate map URL with current center
  const mapUrl = useMemo(() => {
    return `https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=${mapZoom}&output=embed`;
  }, [mapCenter, mapZoom]);

  const handleSensorClick = (sensor) => {
    setSelectedSensor(sensor);
    if (onSensorClick) {
      onSensorClick(sensor);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      good: '#059669',
      moderate: '#D97706',
      poor: '#DC2626',
      critical: '#991B1B'
    };
    return colors?.[status] || colors?.good;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold">Sensor Locations</h3>
        <div className="flex items-center gap-2">
          <span className="refresh-indicator live">
            <span className="refresh-indicator-pulse" />
            <span className="caption">Live</span>
          </span>
        </div>
      </div>
      <div className="relative w-full h-64 md:h-80 lg:h-96 bg-muted rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Environmental Sensor Map"
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
          className="absolute inset-0"
          key={mapUrl} // Force reload when URL changes
        />

        {userLocation && (
          <div className="absolute top-4 left-4 bg-green-500/90 text-white rounded-lg shadow-lg px-3 py-2 text-xs font-medium">
            📍 Your Location: {userLocation.name || 'Current Position'}
          </div>
        )}

        <div className="absolute top-4 right-4 bg-card rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="MapPin" size={16} color="var(--color-primary)" />
            <span className="text-xs md:text-sm font-medium">Active Sensors: {sensors?.length || 0}</span>
          </div>
          {userLocation && (
            <div className="text-xs text-muted-foreground mb-2">
              Center: {mapCenter.lat.toFixed(4)}°, {mapCenter.lng.toFixed(4)}°
            </div>
          )}
          <div className="space-y-1">
            {['good', 'moderate', 'poor', 'critical']?.map(status => (
              <div key={status} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getStatusColor(status) }}
                />
                <span className="text-xs capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedSensor && (
        <div className="mt-4 p-3 md:p-4 bg-muted rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-sm md:text-base font-medium">{selectedSensor?.location}</h4>
              <p className="text-xs md:text-sm text-muted-foreground">{selectedSensor?.address}</p>
            </div>
            <button
              onClick={() => setSelectedSensor(null)}
              className="p-1 hover:bg-background rounded transition-smooth"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <span className="text-xs text-muted-foreground">AQI</span>
              <p className="text-sm md:text-base font-medium">{selectedSensor?.aqi}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Noise</span>
              <p className="text-sm md:text-base font-medium">{selectedSensor?.noise} dB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorMap;