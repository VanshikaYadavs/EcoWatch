import React, { useState } from 'react';
import { useAuth } from '../../../auth/AuthProvider';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';

const LoginForm = () => {
  const { signInWithEmailLink } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    if (!email || !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    setLoading(true);
    const { error: authError } = await signInWithEmailLink(email);
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      // Persist intended role to use in profile setup after auth
      try { localStorage.setItem('ecowatch.intendedRole', role); } catch {}
      setSent(true);
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
          disabled={loading || sent}
        />
      </div>

      <Select
        label="Sign in as"
        options={[
          { value: 'admin', label: 'Administrator' },
          { value: 'official', label: 'Government Official' },
          { value: 'researcher', label: 'Researcher' },
          { value: 'analyst', label: 'Data Analyst' },
          { value: 'leader', label: 'Community Leader' },
          { value: 'viewer', label: 'Viewer' },
        ]}
        value={role}
        onChange={setRole}
        disabled={loading || sent}
      />

      {sent ? (
        <div className="p-4 bg-success/10 border border-success/20 rounded-lg flex items-start gap-3">
          <Icon name="CheckCircle2" size={20} color="var(--color-success)" className="flex-shrink-0 mt-0.5" />
          <p className="text-sm text-success">
            Check your email for the sign-in link. After confirming, you'll be redirected back here.
          </p>
        </div>
      ) : null}

      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={loading}
        iconName="LogIn"
        iconPosition="right"
      >
        Send Sign-in Link
      </Button>

      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          Secure access for authorized personnel only
        </p>
      </div>
    </form>
  );
};

export default LoginForm;