import { supabase } from './supabaseClient';

export async function getProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

export async function upsertProfile(userId, { full_name, role, organization }) {
  if (!userId) throw new Error('Missing userId');
  const payload = {
    id: userId,
    full_name: full_name || null,
    role: role || 'viewer',
    organization: organization || null,
  };
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data;
}
