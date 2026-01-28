import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';
import { getProfile } from '../../utils/profiles';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const finishAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          navigate('/login', { replace: true });
          return;
        }
        // Try exchanging auth code/hash into session (handles magic-link/PKCE flows)
        if (typeof supabase.auth.exchangeCodeForSession === 'function') {
          try {
            await supabase.auth.exchangeCodeForSession(window.location.href);
          } catch {
            // Ignore if not applicable; we'll still attempt getSession next
          }
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          navigate('/login', { replace: true });
          return;
        }

        if (data?.session) {
          try {
            const existing = await getProfile(data.session.user.id);
            if (existing) {
              navigate('/environmental-dashboard', { replace: true });
            } else {
              const intendedRole = localStorage.getItem('ecowatch.intendedRole') || null;
              navigate('/profile-setup', { replace: true, state: { intendedRole } });
            }
          } catch {
            navigate('/profile-setup', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      } catch {
        navigate('/login', { replace: true });
      }
    };

    finishAuth();
  }, [navigate]);

  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">{t('auth.callback.title')}</p>
        <p className="text-sm text-muted-foreground mt-2">{t('auth.callback.subtitle')}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
