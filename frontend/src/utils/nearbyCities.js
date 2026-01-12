function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = n => n * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function dedupeByName(list) {
  const seen = new Set();
  const out = [];
  for (const c of list || []) {
    const nm = String(c?.name || '').trim();
    if (!nm) continue;
    if (seen.has(nm.toLowerCase())) continue;
    seen.add(nm.toLowerCase());
    out.push(c);
  }
  return out;
}

async function fetchNearbyFromOverpass(lat, lon, radiusMeters) {
  const q = `[out:json][timeout:25];(node(around:${radiusMeters},${lat},${lon})[place~"city|town|municipality"];);out center;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Overpass failed ${res.status}`);
  }
  const json = await res.json();
  const elements = Array.isArray(json?.elements) ? json.elements : [];
  return elements
    .map(e => ({ name: e?.tags?.name, lat: e?.lat ?? e?.center?.lat, lon: e?.lon ?? e?.center?.lon }))
    .filter(c => c.name && typeof c.lat === 'number' && typeof c.lon === 'number');
}

export async function getNearbyCities(lat, lon) {
  // 1) Try Overpass (city/town within expanding radius) for generality
  try {
    const radii = [200_000, 300_000, 450_000]; // 200–450 km
    for (const r of radii) {
      const raw = await fetchNearbyFromOverpass(lat, lon, r);
      let list = dedupeByName(raw)
        .filter(c => haversineKm(lat, lon, c.lat, c.lon) > 10) // exclude immediate duplicate of self
        .sort((a, b) => haversineKm(lat, lon, a.lat, a.lon) - haversineKm(lat, lon, b.lat, b.lon));
      if (list.length >= 4) return list.slice(0, 5);
    }
  } catch (e) {
    console.warn('Nearby via Overpass failed:', e?.message || e);
  }

  // 2) Fallback to OpenWeather Geo API with coarse dedupe & distance sort
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!API_KEY) {
    // Gracefully return empty list if key missing
    return [];
  }
  const url = `https://api.openweathermap.org/geo/1.0/find?lat=${lat}&lon=${lon}&cnt=50&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    // Gracefully return empty list if API fails
    return [];
  }
  const data = await res.json();
  const arr = Array.isArray(data) ? data : data?.list || [];
  const mapped = arr.map((city) => ({
    name: city.name,
    lat: city.lat ?? city?.coord?.lat,
    lon: city.lon ?? city?.coord?.lon,
  })).filter(c => typeof c.lat === 'number' && typeof c.lon === 'number');

  const distinct = dedupeByName(mapped)
    .filter(c => haversineKm(lat, lon, c.lat, c.lon) > 10)
    .sort((a, b) => haversineKm(lat, lon, a.lat, a.lon) - haversineKm(lat, lon, b.lat, b.lon));
  return distinct.slice(0, 5);
}
