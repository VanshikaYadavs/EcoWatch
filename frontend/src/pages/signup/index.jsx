import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'official', label: 'Government Official' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'analyst', label: 'Data Analyst' },
  { value: 'leader', label: 'Community Leader' },
  { value: 'viewer', label: 'Viewer' },
];

const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signUpWithPassword } = useAuth();

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('viewer');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    if (!fullName.trim()) return setError('Please enter your full name');
    if (!email || !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(email)) return setError('Please enter a valid email');
    if (!password || password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    if (!phone.trim()) return setError('Please enter your phone number');
    if (!/^\+?[0-9\-\s()]{7,15}$/.test(phone.trim())) return setError('Please enter a valid phone number');
    setLoading(true);
    const { error: authError } = await signUpWithPassword({
      email,
      password,
      full_name: fullName.trim(),
      role,
      organization: organization?.trim() || null,
      phone: phone.trim(),
    });
    setLoading(false);
    if (authError) return setError(authError.message);
    setSent(true);
  };

  return (
    <>
      <Helmet>
        <title>{`${t('signup.title')} - EcoWatch`}</title>
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border shadow-sm">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Icon name="Waves" size={28} color="#FFFFFF" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">EchoWatch</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Environmental Monitoring System</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-xl p-6 md:p-8 lg:p-10">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t('signup.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('signup.subtitle')}</p>
            </div>

            {sent ? (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg mb-6">
                <p className="text-sm text-success">Verification email sent. Please check your inbox and then return to log in.</p>
                <div className="mt-4">
                  <Button onClick={() => navigate('/login')} variant="default" iconName="LogIn">
                    {/* Auto-translate button label if missing key */}
                    <span>{t('login') || 'Login'}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
 param($m) $text = $m.Value; if ($text -match '=======(.*?)>>>>>>>') { $matches[1].Trim() + "`n" } else { '' } translation
                {error ? <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">{error}</div> : null}
                <Button type="submit" variant="default" loading={loading} iconName="UserPlus">
                  {t('buttons.createAccount') || 'Create Account'}
                </Button>
              </form>
            )}
          </div>
        </main>
      </div>

      <Chatbot />
    </>
  );
};

export default Signup;

