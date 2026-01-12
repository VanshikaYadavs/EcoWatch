import axios from "axios";
import { supabase } from "../utils/supabaseClient";

/**
 * Fetch latest environmental reading
 */
export async function getLatestReading(location = null) {
  // Prefer backend API (service role) to avoid RLS visibility and label mismatches
  try {
    const base = import.meta.env.VITE_API_BASE || "http://localhost:8080";
    const url = new URL("/api/readings/latest", base);
    if (location && typeof location === "string" && location !== "all") {
      url.searchParams.set("location", location);
    }
    url.searchParams.set("limit", "1");
    const res = await axios.get(url.toString());
    const first = Array.isArray(res?.data?.data) ? res.data.data[0] : null;
    if (first) return first;
    // Fallback: try without location filter to get any latest row
    if (location) {
      const url2 = new URL("/api/readings/latest", base);
      url2.searchParams.set("limit", "1");
      const res2 = await axios.get(url2.toString());
      const first2 = Array.isArray(res2?.data?.data) ? res2.data.data[0] : null;
      if (first2) return first2;
    }
  } catch (e) {
    console.warn("Backend latest read failed, falling back to Supabase:", e?.message || e);
  }

  // Supabase fallback (subject to RLS)
  try {
    let q = supabase
      .from("environment_readings")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(1);
    if (location && typeof location === "string" && location !== "all") {
      q = q.eq("location", location);
    }
    const { data, error } = await q.maybeSingle();
    if (error) {
      console.error("Supabase error:", error.message);
      return null;
    }
    if (data) return data;
    // Last resort: fetch any latest row without filter
    if (location) {
      const { data: anyRow, error: e3 } = await supabase
        .from("environment_readings")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (e3) {
        console.error("Supabase error:", e3.message);
        return null;
      }
      return anyRow ?? null;
    }
    return null;
  } catch (e2) {
    console.error("Latest reading fetch failed:", e2?.message || e2);
    return null;
  }
}
