import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured, supabaseEnv } from '../../../utils/supabaseClient';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('Login attempt:', email);

    try {
      if (!isSupabaseConfigured) {
        setError(`Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.`);
        setLoading(false);
        return;
      }

      if (!email || !password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      const withTimeout = (p, ms = 7000) =>
        Promise.race([
          p,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), ms)),
        ]);

      const { data, error: authError } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password })
      );

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // login successful
      setLoading(false);
      navigate('/environmental-dashboard');
    } catch (err) {
      setError(err?.message || 'Unexpected error during login');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {!isSupabaseConfigured ? (
        <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-sm">
          Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
        </div>
      ) : null}
      <div>
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e?.target?.value)}
          error={error}
          required
          disabled={loading}
        />
      </div>

      <div>
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e?.target?.value)}
          required
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={loading}
        iconName="LogIn"
        iconPosition="right"
        disabled={!isSupabaseConfigured}
      >
        Sign In
      </Button>

      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;