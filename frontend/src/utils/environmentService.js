import { supabase } from '../utils/supabaseClient';

// Fetch the latest environmental reading (single row)
export async function getLatestEnvironmentData() {
  const { data, error } = await supabase
    .from('environment_readings')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

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
