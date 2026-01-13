export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject({ code: -1, message: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        // error.code: 1 (PERMISSION_DENIED), 2 (POSITION_UNAVAILABLE), 3 (TIMEOUT)
        reject({ code: error?.code ?? 0, message: error?.message || 'Geolocation error' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  });
}

// Reverse geocode GPS coordinates to get actual location name
export async function getLocationName(lat, lon) {
  try {
    // Use Nominatim reverse geocoding (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'EcoWatch-App/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    // Extract location name from address components (most specific to least specific)
    const address = data.address || {};
    const locationName = 
      address.neighbourhood ||
      address.suburb ||
      address.locality ||
      address.village ||
      address.town ||
      address.city ||
      address.state_district ||
      address.state ||
      data.display_name?.split(',')[0] ||
      'Unknown Location';
    
    return locationName;
  } catch (error) {
    console.warn('Reverse geocoding error:', error);
    return null;
  }
}

