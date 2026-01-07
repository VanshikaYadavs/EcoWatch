import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const AccountSecurity = ({ profileData, onProfileChange }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);

  const handlePasswordChange = () => {
    if (passwordForm?.newPassword !== passwordForm?.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Changing password');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleToggle2FA = () => {
    onProfileChange({
      ...profileData,
      twoFactorEnabled: !profileData?.twoFactorEnabled
    });
  };

  const activeSessions = [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'Jaipur, Rajasthan',
      lastActive: '2 minutes ago',
      current: true
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'Jaipur, Rajasthan',
      lastActive: '3 hours ago',
      current: false
    }
  ];

  const handleRevokeSession = (sessionId) => {
    console.log('Revoking session:', sessionId);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Password Change */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Lock" size={20} color="var(--color-primary)" />
          Change Password
        </h3>
        <div className="bg-muted rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Last changed: {profileData?.lastPasswordChange}
            </p>
            <Checkbox
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e?.target?.checked)}
              label="Show passwords"
            />
          </div>
          <Input
            label="Current Password"
            type={showPasswords ? 'text' : 'password'}
            value={passwordForm?.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e?.target?.value })}
            required
          />
          <Input
            label="New Password"
            type={showPasswords ? 'text' : 'password'}
            value={passwordForm?.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e?.target?.value })}
            description="Must be at least 8 characters with uppercase, lowercase, and numbers"
            required
          />
          <Input
            label="Confirm New Password"
            type={showPasswords ? 'text' : 'password'}
            value={passwordForm?.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e?.target?.value })}
            required
          />
          <Button
            variant="default"
            iconName="Key"
            iconPosition="left"
            onClick={handlePasswordChange}
            disabled={!passwordForm?.currentPassword || !passwordForm?.newPassword || !passwordForm?.confirmPassword}
          >
            Update Password
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Smartphone" size={20} color="var(--color-primary)" />
          Two-Factor Authentication
        </h3>
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-foreground">2FA Status</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profileData?.twoFactorEnabled
                    ? 'bg-success/10 text-success' :'bg-muted-foreground/10 text-muted-foreground'
                }`}>
                  {profileData?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account by requiring a verification code in addition to your password.
              </p>
            </div>
            <Button
              variant={profileData?.twoFactorEnabled ? 'destructive' : 'default'}
              iconName={profileData?.twoFactorEnabled ? 'ShieldOff' : 'ShieldCheck'}
              iconPosition="left"
              onClick={handleToggle2FA}
            >
              {profileData?.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
            </Button>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Monitor" size={20} color="var(--color-primary)" />
          Active Sessions
        </h3>
        <div className="space-y-3">
          {activeSessions?.map((session) => (
            <div
              key={session?.id}
              className="bg-muted rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-card rounded-lg">
                  <Icon name="Monitor" size={20} color="var(--color-primary)" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{session?.device}</h4>
                    {session?.current && (
                      <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {session?.location} • Last active {session?.lastActive}
                  </p>
                </div>
              </div>
              {!session?.current && (
                <Button
                  variant="outline"
                  size="sm"
                  iconName="X"
                  iconPosition="left"
                  onClick={() => handleRevokeSession(session?.id)}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <Icon name="Info" size={20} color="var(--color-primary)" className="mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground mb-1">Security Best Practices</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use a strong, unique password for your account</li>
            <li>• Enable two-factor authentication for enhanced security</li>
            <li>• Review active sessions regularly and revoke unknown devices</li>
            <li>• Never share your password or verification codes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AccountSecurity;