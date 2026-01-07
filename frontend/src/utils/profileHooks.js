import { useEffect, useState } from 'react';
import { getProfile } from './profiles';

export function useMyProfile(user) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) { setProfile(null); setLoading(false); return; }
      setLoading(true);
      setError(null);
      try {
        const p = await getProfile(user.id);
        if (!cancelled) setProfile(p);
      } catch (e) {
        if (!cancelled) setError(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  return { profile, loading, error };
}
