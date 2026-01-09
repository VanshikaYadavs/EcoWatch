import { supabase } from "../utils/supabaseClient";

/**
 * Fetch latest environmental reading
 */
export async function getLatestReading() {
  const { data, error } = await supabase
    .from("environment_readings")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }

  return data;
}
