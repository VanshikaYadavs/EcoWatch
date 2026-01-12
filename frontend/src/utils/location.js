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

// Normalize a raw place name for display purposes.
// If the name appears to be an institutional/administrative label (e.g., Police Commissionerate),
// fall back to the provided city label.
// Example: displayLocation('Police Commissionerate', 'Jaipur') -> 'Jaipur'
export function displayLocation(rawName, city) {
  const nm = String(rawName || '').trim();
  const fallback = String(city || '').trim() || nm;
  if (!nm) return fallback;
  const blacklist = ['police', 'commissionerate', 'station', 'office'];
  const lower = nm.toLowerCase();
  if (blacklist.some(w => lower.includes(w))) return fallback || nm;
  return nm;
}
