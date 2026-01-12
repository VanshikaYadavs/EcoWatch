import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AutoText from '../../components/ui/AutoText';
import ProfileDetails from './components/ProfileDetails';
import RoleManagement from './components/RoleManagement';
import AccountSecurity from './components/AccountSecurity';
import NotificationPreferences from './components/NotificationPreferences';
import ActivityHistory from './components/ActivityHistory';
import AccountStatistics from './components/AccountStatistics';
import { useAuth } from '../../auth/AuthProvider';

const UserProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [activeTab, setActiveTab] = useState('details');
  const [profileData, setProfileData] = useState({
    // User Details
    name: 'John Smith',
    email: 'official@echowatch.gov',
    organization: 'Environmental Protection Agency',
    phone: '+1 (555) 123-4567',
    department: 'Air Quality Division',
    location: 'Jaipur, Rajasthan',
    profilePhoto: null,
    // Role Information
    role: 'official',
    accessLevel: 'Government Official',
    permissions: ['view_all_data', 'generate_reports', 'configure_alerts', 'export_data'],
    // Security Settings
    twoFactorEnabled: false,
    lastPasswordChange: '2025-12-15',
    activeSessions: 2,
    // Notification Preferences
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyDigest: true,
    criticalAlertsOnly: false
  });

  const tabs = [
    { id: 'details', label: t('profile.tabs.details'), icon: 'User' },
    { id: 'role', label: t('profile.tabs.role'), icon: 'Shield' },
    { id: 'security', label: t('profile.tabs.security'), icon: 'Lock' },
    { id: 'notifications', label: t('profile.tabs.notifications'), icon: 'Bell' },
    { id: 'activity', label: t('profile.tabs.activity'), icon: 'History' },
    { id: 'statistics', label: t('profile.tabs.statistics'), icon: 'BarChart3' }
  ];

  const handleSaveProfile = () => {
    console.log('Saving profile:', profileData);
    // In real implementation, this would save to backend
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(profileData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'profile-data.json';
    link?.click();
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      // best-effort fallback: proceed to login regardless
    }
    try { localStorage.removeItem('ecowatch.intendedRole'); } catch {}
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            <AutoText i18nKey="profile.title" defaultText="User Profile" />
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            <AutoText i18nKey="profile.subtitle" defaultText="Manage your personal information, role settings, and account preferences" />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={handleExportData}
          >
            {t('profile.buttons.export')}
          </Button>
          <Button
            variant="default"
            iconName="Save"
            iconPosition="left"
            onClick={handleSaveProfile}
          >
            {t('profile.buttons.save')}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-card border border-border rounded-lg p-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`
                flex items-center justify-center gap-2 px-4 py-3 rounded-md
                transition-all duration-200 font-medium text-sm
                ${activeTab === tab?.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <Icon name={tab?.icon} size={18} />
              <span className="hidden sm:inline">{tab?.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-lg">
        {activeTab === 'details' && (
          <ProfileDetails
            profileData={profileData}
            onProfileChange={setProfileData}
          />
        )}
        {activeTab === 'role' && (
          <RoleManagement
            profileData={profileData}
            onProfileChange={setProfileData}
          />
        )}
        {activeTab === 'security' && (
          <AccountSecurity
            profileData={profileData}
            onProfileChange={setProfileData}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationPreferences
            profileData={profileData}
            onProfileChange={setProfileData}
          />
        )}
        {activeTab === 'activity' && (
          <ActivityHistory />
        )}
        {activeTab === 'statistics' && (
          <AccountStatistics />
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <Icon name="Info" size={20} color="var(--color-primary)" className="mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground mb-1">{t('profile.account.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('profile.account.description')}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Icon name="LogOut" size={20} color="var(--color-error)" className="mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground">{t('profile.logout.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('profile.logout.subtitle')}</p>
          </div>
        </div>
        <Button
          variant="destructive"
          iconName="LogOut"
          iconPosition="left"
          onClick={handleLogout}
        >
          {t('profile.logout.button')}
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;