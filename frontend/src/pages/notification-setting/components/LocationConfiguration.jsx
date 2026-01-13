import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import {
  getUserLocations,
  updateUserLocations,
  getAvailableLocations,
  getCurrentPosition,
  getNearbyLocations,
} from '../../../services/location.service';

const LocationConfiguration = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [alertRadius, setAlertRadius] = useState(50);
  const [autoDetect, setAutoDetect] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [nearbyLocs, setNearbyLocs] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load available locations and user preferences
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [availableLocs, userLocs] = await Promise.all([
        getAvailableLocations(),
        getUserLocations(),
      ]);

      setLocations(availableLocs.locations || []);
      setSelectedLocations(userLocs.monitored_locations || []);
      setAlertRadius(userLocs.alert_radius_km || 50);
      setAutoDetect(userLocs.auto_detect_location || false);
    } catch (err) {
      setError(err.message || 'Failed to load locations');
      console.error('Error loading locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUserLocations({
        monitored_locations: selectedLocations,
        alert_radius_km: alertRadius,
        auto_detect_location: autoDetect,
      });
      setSuccess('Location preferences saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleLocationToggle = (locationName) => {
    setSelectedLocations((prev) => {
      if (prev.includes(locationName)) {
        return prev.filter((loc) => loc !== locationName);
      } else {
        return [...prev, locationName];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedLocations(locations.map((loc) => loc.canonical_name));
  };

  const handleClearAll = () => {
    setSelectedLocations([]);
  };

  const handleAutoDetect = async () => {
    setDetectingLocation(true);
    setError(null);
    try {
      const position = await getCurrentPosition();
      setUserPosition(position);

      const nearby = await getNearbyLocations(
        position.latitude,
        position.longitude,
        alertRadius
      );

      setNearbyLocs(nearby.nearby_locations || []);

      // Auto-select nearby locations
      const nearbyNames = nearby.nearby_locations.map((loc) => loc.canonical_name);
      setSelectedLocations((prev) => {
        const newSelection = [...new Set([...prev, ...nearbyNames])];
        return newSelection;
      });

      setSuccess(`Found ${nearby.nearby_locations.length} locations within ${alertRadius}km`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to detect location');
    } finally {
      setDetectingLocation(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Location Monitoring
        </h2>
        <p className="text-sm text-muted-foreground">
          Select which locations you want to monitor. You'll only receive alerts for environmental readings from your selected locations.
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <Icon name="AlertCircle" size={20} color="var(--color-destructive)" className="mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-destructive hover:opacity-80">
            <Icon name="X" size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
          <Icon name="CheckCircle" size={20} color="rgb(34 197 94)" className="mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-600">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-600 hover:opacity-80">
            <Icon name="X" size={16} />
          </button>
        </div>
      )}

      {/* Auto-Detect Section */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              <Icon name="MapPin" size={20} />
              Auto-Detect Nearby Locations
            </h3>
            <p className="text-sm text-muted-foreground">
              Use your device's location to automatically find and select nearby monitoring stations.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Search Radius:</label>
            <select
              value={alertRadius}
              onChange={(e) => setAlertRadius(Number(e.target.value))}
              className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
            >
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
              <option value={200}>200 km</option>
            </select>
          </div>

          <Button
            variant="default"
            iconName="Navigation"
            iconPosition="left"
            onClick={handleAutoDetect}
            disabled={detectingLocation}
          >
            {detectingLocation ? 'Detecting...' : 'Detect My Location'}
          </Button>
        </div>

        {userPosition && nearbyLocs.length > 0 && (
          <div className="mt-4 p-4 bg-background rounded-md border border-border">
            <p className="text-sm font-medium text-foreground mb-2">
              📍 Your Location: {userPosition.latitude.toFixed(4)}°, {userPosition.longitude.toFixed(4)}°
            </p>
            <p className="text-xs text-muted-foreground">
              Found {nearbyLocs.length} location(s) within {alertRadius}km:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {nearbyLocs.map((loc) => (
                <span
                  key={loc.canonical_name}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                >
                  {loc.canonical_name} ({loc.distance_km.toFixed(1)}km)
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Location Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">
            Select Locations ({selectedLocations.length} of {locations.length})
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedLocations.length === locations.length}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={selectedLocations.length === 0}
            >
              Clear All
            </Button>
          </div>
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="MapOff" size={48} className="mx-auto mb-2 opacity-50" />
            <p>No locations available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {locations.map((location) => {
              const isSelected = selectedLocations.includes(location.canonical_name);
              const nearbyLoc = nearbyLocs.find(
                (loc) => loc.canonical_name === location.canonical_name
              );

              return (
                <button
                  key={location.canonical_name}
                  onClick={() => handleLocationToggle(location.canonical_name)}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-200 text-left
                    ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon
                          name={isSelected ? 'CheckCircle2' : 'Circle'}
                          size={18}
                          color={isSelected ? 'var(--color-primary)' : 'var(--color-muted-foreground)'}
                        />
                        <span className="font-medium text-foreground">
                          {location.canonical_name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        {location.state}
                      </p>
                      {nearbyLoc && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                          {nearbyLoc.distance_km.toFixed(1)}km away
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
        <Icon name="Info" size={20} color="rgb(59 130 246)" className="mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground mb-1">How Location Monitoring Works</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• You'll only receive alerts for environmental readings from your selected locations</li>
            <li>• Select multiple locations to monitor different areas simultaneously</li>
            <li>• Use auto-detect to quickly find stations near your current location</li>
            <li>• Adjust the search radius to control how far you want to monitor</li>
          </ul>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={loadData}
          disabled={saving}
        >
          Reset
        </Button>
        <Button
          variant="default"
          iconName="Save"
          iconPosition="left"
          onClick={handleSave}
          disabled={saving || selectedLocations.length === 0}
        >
          {saving ? 'Saving...' : 'Save Location Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default LocationConfiguration;
