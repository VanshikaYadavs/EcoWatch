import { supabase } from "../utils/supabaseClient";

/**
 * Fetch latest environmental reading
 */
export async function getLatestReading(location = null) {
  let q = supabase
    .from("environment_readings")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(1);

  if (location && typeof location === 'string' && location !== 'all') {
    q = q.eq('location', location);
  }

  const { data, error } = await q.maybeSingle();

  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }

  return data;
}
