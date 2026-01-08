import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    if (!email || !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please enter your password');
      return;
    }
    setLoading(true);
    const { error: authError } = await signInWithPassword(email, password);
    setLoading(false);
    if (authError) {
      setError(authError.message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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