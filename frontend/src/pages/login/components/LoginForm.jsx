import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const AUTH_KEY = 'ecowatch.auth';
  const USER_KEY = 'ecowatch.user';
  const USERS_KEY = 'ecowatch.users';

  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isSignUp = mode === 'signup';

  const roleOptions = [
    { value: 'admin', label: 'Administrator', description: 'Full system access' },
    { value: 'official', label: 'Government Official', description: 'Policy and decision-making' },
    { value: 'leader', label: 'Community Leader', description: 'Public communication' },
    { value: 'health', label: 'Health Official', description: 'Health data access' },
    { value: 'responder', label: 'Emergency Responder', description: 'Emergency response' },
    { value: 'analyst', label: 'Data Analyst', description: 'Analytics and reporting' },
    { value: 'researcher', label: 'Researcher', description: 'Research and analysis' }
  ];

  const mockCredentials = [
    { email: 'admin@echowatch.gov', password: 'Admin@2026', role: 'admin' },
    { email: 'official@echowatch.gov', password: 'Official@2026', role: 'official' },
    { email: 'leader@echowatch.gov', password: 'Leader@2026', role: 'leader' },
    { email: 'health@echowatch.gov', password: 'Health@2026', role: 'health' },
    { email: 'responder@echowatch.gov', password: 'Responder@2026', role: 'responder' },
    { email: 'analyst@echowatch.gov', password: 'Analyst@2026', role: 'analyst' },
    { email: 'researcher@echowatch.gov', password: 'Research@2026', role: 'researcher' }
  ];

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += chars?.charAt(Math.floor(Math.random() * chars?.length));
    }
    setGeneratedCaptcha(captcha);
    setCaptchaValue('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (isSignUp) {
      if (!formData?.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData?.confirmPassword !== formData?.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData?.role) {
      newErrors.role = 'Please select your role';
    }

    if (!isSignUp && showCaptcha && captchaValue !== generatedCaptcha) {
      newErrors.captcha = 'CAPTCHA verification failed. Please try again.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const safeParseUsers = () => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const persistAuth = (email, role) => {
    const storage = formData?.rememberMe ? localStorage : sessionStorage;
    const otherStorage = formData?.rememberMe ? sessionStorage : localStorage;

    storage.setItem(AUTH_KEY, '1');
    storage.setItem(
      USER_KEY,
      JSON.stringify({
        email,
        role,
        loggedInAt: new Date().toISOString()
      })
    );
    otherStorage.removeItem(AUTH_KEY);
    otherStorage.removeItem(USER_KEY);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      if (isSignUp) {
        const users = safeParseUsers();
        const normalizedEmail = String(formData?.email || '').trim().toLowerCase();

        const existsInSaved = users.some(u => String(u?.email || '').toLowerCase() === normalizedEmail);
        const existsInMock = mockCredentials.some(u => String(u?.email || '').toLowerCase() === normalizedEmail);

        if (existsInSaved || existsInMock) {
          setErrors({ submit: 'An account with this email already exists. Please sign in.' });
          setIsLoading(false);
          return;
        }

        const nextUsers = [
          ...users,
          {
            email: normalizedEmail,
            password: formData?.password,
            role: formData?.role,
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));

        persistAuth(normalizedEmail, formData?.role);
        navigate('/environmental-dashboard');
        setIsLoading(false);
        return;
      }

      const users = safeParseUsers();
      const normalizedEmail = String(formData?.email || '').trim().toLowerCase();

      const validCredential = [...mockCredentials, ...users]?.find(
        cred => String(cred?.email || '').toLowerCase() === normalizedEmail &&
                cred?.password === formData?.password &&
                cred?.role === formData?.role
      );

      if (validCredential) {
        persistAuth(normalizedEmail, formData?.role);
        navigate('/environmental-dashboard');
      } else {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);

        if (newFailedAttempts >= 3) {
          setShowCaptcha(true);
          generateCaptcha();
        }

        setErrors({
          submit: `Invalid credentials. Please check your email, password, and role.\n${newFailedAttempts >= 3 ? 'CAPTCHA verification required after multiple failed attempts.' : ''}`
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = () => {
    alert('Password reset functionality would be implemented here.\nPlease contact your system administrator.');
  };

  React.useEffect(() => {
    if (!isSignUp && showCaptcha && !generatedCaptcha) {
      generateCaptcha();
    }
  }, [showCaptcha, isSignUp]);

  React.useEffect(() => {
    setErrors({});
    setFailedAttempts(0);
    setShowCaptcha(false);
    setCaptchaValue('');
    setGeneratedCaptcha('');
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
  }, [mode]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Email Address"
          type="email"
          placeholder="your.email@echowatch.gov"
          value={formData?.email}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={errors?.email}
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData?.password}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
            error={errors?.password}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 touch-target p-2 text-muted-foreground hover:text-foreground transition-smooth"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>
      </div>

      {isSignUp && (
        <div>
          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={formData?.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
            error={errors?.confirmPassword}
            required
            disabled={isLoading}
          />
        </div>
      )}
      <div>
        <Select
          label="User Role"
          placeholder="Select your role"
          options={roleOptions}
          value={formData?.role}
          onChange={(value) => handleInputChange('role', value)}
          error={errors?.role}
          required
          disabled={isLoading}
          searchable
        />
      </div>
      {!isSignUp && showCaptcha && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-border">
            <div className="flex-1 select-none">
              <div 
                className="text-2xl font-bold tracking-wider text-foreground bg-background px-4 py-3 rounded border-2 border-border font-data"
                style={{ 
                  letterSpacing: '0.3em',
                  textDecoration: 'line-through',
                  textDecorationStyle: 'wavy',
                  textDecorationColor: 'var(--color-primary)'
                }}
              >
                {generatedCaptcha}
              </div>
            </div>
            <button
              type="button"
              onClick={generateCaptcha}
              className="touch-target p-2 rounded-lg bg-background hover:bg-muted transition-smooth"
              aria-label="Regenerate CAPTCHA"
            >
              <Icon name="RefreshCw" size={20} color="var(--color-foreground)" />
            </button>
          </div>
          <Input
            label="Enter CAPTCHA"
            type="text"
            placeholder="Type the characters above"
            value={captchaValue}
            onChange={(e) => setCaptchaValue(e?.target?.value)}
            error={errors?.captcha}
            required
            disabled={isLoading}
          />
        </div>
      )}
      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          checked={formData?.rememberMe}
          onChange={(e) => handleInputChange('rememberMe', e?.target?.checked)}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-smooth"
          disabled={isLoading}
        >
          Forgot Password?
        </button>
      </div>
      {errors?.submit && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
          <Icon name="AlertCircle" size={20} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error whitespace-pre-line">{errors?.submit}</p>
        </div>
      )}
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        iconName={isSignUp ? 'UserPlus' : 'LogIn'}
        iconPosition="right"
      >
        {isSignUp ? 'Create Account' : 'Sign In'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-smooth"
          onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
          disabled={isLoading}
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          Secure access for authorized personnel only
        </p>
      </div>
    </form>
  );
};

export default LoginForm;