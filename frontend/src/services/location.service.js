/**
 * Location Service
 * Handles all location-related API calls and geolocation functionality
 */

import { supabase } from '../utils/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Get the user's authentication token
 */
async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

/**
 * Get the user's monitored locations
 * @returns {Promise<{monitored_locations: string[], alert_radius_km: number, auto_detect_location: boolean}>}
 */
export async function getUserLocations() {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/user/locations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user locations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user locations:', error);
    throw error;
  }
}

/**
 * Update the user's monitored locations
 * @param {Object} updates - Updates to apply
 * @param {string[]} [updates.monitored_locations] - Array of location names to monitor
 * @param {number} [updates.alert_radius_km] - Alert radius in kilometers
 * @param {boolean} [updates.auto_detect_location] - Enable auto-detection of user location
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function updateUserLocations(updates) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/user/locations`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user locations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user locations:', error);
    throw error;
  }
}

/**
 * Get list of all available locations from the database
 * @returns {Promise<{locations: Array<{canonical_name: string, latitude: number, longitude: number, state: string}>}>}
 */
export async function getAvailableLocations() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/locations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch available locations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching available locations:', error);
    throw error;
  }
}

/**
 * Normalize a location name to its canonical form
 * @param {string} locationName - The location name to normalize
 * @returns {Promise<{normalized_name: string}>}
 */
export async function normalizeLocationName(locationName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/locations/normalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location_name: locationName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to normalize location name');
    }

    return await response.json();
  } catch (error) {
    console.error('Error normalizing location name:', error);
    throw error;
  }
}

/**
 * Find nearby locations based on coordinates
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} [radiusKm=50] - Search radius in kilometers
 * @returns {Promise<{user_location: Object, radius_km: number, nearby_locations: Array}>}
 */
export async function getNearbyLocations(latitude, longitude, radiusKm = 50) {
  try {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      radius_km: radiusKm.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/api/locations/nearby?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch nearby locations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    throw error;
  }
}

/**
 * Get the user's current location using the Geolocation API
 * @param {Object} [options] - Geolocation options
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
export async function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = 'Unknown error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );
  });
}

/**
 * Auto-detect user location and find nearby monitored locations
 * @param {number} [radiusKm=50] - Search radius in kilometers
 * @returns {Promise<{userPosition: Object, nearbyLocations: Array}>}
 */
export async function autoDetectAndFindLocations(radiusKm = 50) {
  try {
    const position = await getCurrentPosition();
    const nearby = await getNearbyLocations(position.latitude, position.longitude, radiusKm);
    
    return {
      userPosition: position,
      nearbyLocations: nearby.nearby_locations || [],
    };
  } catch (error) {
    console.error('Error in auto-detect and find locations:', error);
    throw error;
  }
}

/**
 * Watch the user's position continuously
 * @param {Function} onPositionChange - Callback when position changes
 * @param {Function} onError - Callback when error occurs
 * @param {Object} [options] - Geolocation options
 * @returns {number} Watch ID that can be used to clear the watch
 */
export function watchPosition(onPositionChange, onError, options = {}) {
  if (!navigator.geolocation) {
    if (onError) onError(new Error('Geolocation is not supported by your browser'));
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onPositionChange({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      if (onError) {
        let message = 'Unknown error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        onError(new Error(message));
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Cache position for 1 minute
      ...options,
    }
  );
}

/**
 * Clear position watch
 * @param {number} watchId - The watch ID returned by watchPosition
 */
export function clearWatch(watchId) {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (n) => (n * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}
