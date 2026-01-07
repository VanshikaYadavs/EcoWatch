import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signInWithEmailLink: async (_email) => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Load session from storage first
      const { data } = await supabase.auth.getSession();
      let sess = data?.session ?? null;
      let usr = sess?.user ?? null;

      // Validate session against Supabase API (handles deleted/expired users)
      if (sess) {
        try {
          const { data: userData, error } = await supabase.auth.getUser();
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
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      // On any auth change, validate the user from server
      if (sess) {
        const { data: userData, error } = await supabase.auth.getUser();
        if (error || !userData?.user) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
        } else {
          setSession(sess);
          setUser(userData.user);
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

  const signInWithEmailLink = async (email) => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    return supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo(() => ({ user, session, loading, signInWithEmailLink, signOut }), [user, session, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
