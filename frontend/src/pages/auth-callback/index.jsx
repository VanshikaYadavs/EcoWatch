import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let timer = setTimeout(async () => {
      // Supabase will process the hash in URL and set session automatically.
      // We just try to load session and redirect.
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        navigate('/environmental-dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Signing you in…</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait a moment.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
