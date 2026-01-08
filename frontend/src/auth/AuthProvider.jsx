import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signInWithPassword: async (_email, _password) => {},
  signUpWithPassword: async (_params) => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Helper to prevent hangs
        const withTimeout = (p, ms = 2000) =>
          Promise.race([
            p,
            new Promise((_, reject) => setTimeout(() => reject(new Error('auth_timeout')), ms)),
          ]);

        // Load session from storage first (with timeout)
        const { data } = await withTimeout(supabase.auth.getSession());
        let sess = data?.session ?? null;
        let usr = sess?.user ?? null;

        // Validate session against Supabase API (handles deleted/expired users)
        if (sess) {
          try {
            // Guard against hanging on network by timing out validation
            const { data: userData, error } = await withTimeout(supabase.auth.getUser());
            if (error || !userData?.user) {
              await supabase.auth.signOut();
              sess = null;
              usr = null;
            } else {
              usr = userData.user;
            }
          } catch {
            // On unexpected error, fail closed (treat as signed out)
            await supabase.auth.signOut();
            sess = null;
            usr = null;
          }
        }

        if (!mounted) return;
        setSession(sess);
        setUser(usr);
      } catch {
        if (!mounted) return;
        setSession(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      // On any auth change, validate the user from server
      if (sess) {
        try {
          const withTimeout = (p, ms = 2000) =>
            Promise.race([
              p,
              new Promise((_, reject) => setTimeout(() => reject(new Error('auth_timeout')), ms)),
            ]);
          const { data: userData, error } = await withTimeout(supabase.auth.getUser());
        if (error || !userData?.user) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
        } else {
          setSession(sess);
          setUser(userData.user);
        }
        } catch {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
        }
      } else {
        setSession(null);
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const signInWithPassword = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  // params: { email, password, full_name, role, organization }
  // Stores profile data in auth metadata; DB trigger will copy to public.profiles on user creation
  const signUpWithPassword = async ({ email, password, full_name, role, organization }) => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { full_name, role, organization },
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo(() => ({ user, session, loading, signInWithPassword, signUpWithPassword, signOut }), [user, session, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
