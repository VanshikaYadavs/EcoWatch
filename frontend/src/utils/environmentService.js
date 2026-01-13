import { supabase } from '../utils/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Fetch the latest environmental reading (single row)
export async function getLatestEnvironmentData(location = null) {
  let q = supabase
    .from('environment_readings')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(1);

  if (location && typeof location === 'string' && location !== 'all') {
    q = q.eq('location', location);
  }

  const { data, error } = await q.maybeSingle();

  if (error) {
    console.error('Error fetching latest data:', error.message);
    return null;
  }
  return data;
}

// Fetch historical readings (most recent first)
export async function getEnvironmentHistory(limit = 50) {
  const { data, error } = await supabase
    .from('environment_readings')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching history:', error.message);
    return [];
  }
  return data || [];
}

// Fetch dashboard statistics from backend
export async function getDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

// Fetch map sensors data from backend
export async function getMapSensors() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/sensors`);
    if (!response.ok) {
      throw new Error('Failed to fetch map sensors');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching map sensors:', error);
    return { sensors: [], count: 0 };
  }
}

// Check backend API status
export async function checkBackendStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ping`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    if (!response.ok) {
      return { status: 'error', message: 'Backend responded with error' };
    }
    const data = await response.json();
    return { status: 'operational', message: 'Connected', data };
  } catch (error) {
    console.error('Backend status check failed:', error);
    return { status: 'error', message: 'Backend not reachable' };
  }
}

// Fetch nearby sensors from backend
export async function getNearbySensors() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/sensors`);
    if (!response.ok) {
      throw new Error('Failed to fetch nearby sensors');
    }
    const data = await response.json();
    return data.sensors || [];
  } catch (error) {
    console.error('Error fetching nearby sensors:', error);
    return [];
  }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Fetch nearby sensors sorted by distance from user location
export async function getNearbySensorsByLocation(userLat, userLon, maxDistanceKm = 50) {
  try {
    const sensors = await getNearbySensors();
    
    // Filter out sensors without valid coordinates
    const validSensors = sensors.filter(s => s.lat && s.lng && s.lat !== 0 && s.lng !== 0);
    
    // Calculate distance for each sensor
    const sensorsWithDistance = validSensors.map(sensor => ({
      ...sensor,
      distance: calculateDistance(userLat, userLon, sensor.lat, sensor.lng)
    }));
    
    // Filter by max distance and sort by distance
    return sensorsWithDistance
      .filter(s => s.distance <= maxDistanceKm)
      .sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error fetching nearby sensors by location:', error);
    return [];
  }
}

