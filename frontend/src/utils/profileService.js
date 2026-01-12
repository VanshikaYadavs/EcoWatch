import { supabase } from './supabaseClient';

/**
 * Load user profile data including phone number
 */
export async function loadUserProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

/**
 * Update user profile including phone number
 */
export async function updateUserProfile(userId, updates) {
  if (!userId) throw new Error('Missing userId');
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update user phone number
 */
export async function updatePhoneNumber(userId, phoneNumber) {
  return updateUserProfile(userId, { phone_number: phoneNumber });
}

/**
 * Validate phone number format (E.164)
 */
export function isValidPhoneNumber(phoneNumber) {
  if (!phoneNumber) return false;
  // Basic E.164 format: +[country code][number] (e.g., +911234567890)
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}
