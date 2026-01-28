import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AutoText from '../../components/ui/AutoText';
import ThresholdConfiguration from './components/ThresholdConfiguration';
import ChannelConfiguration from './components/ChannelConfiguration';
import FrequencyConfiguration from './components/FrequencyConfiguration';
import NotificationHistory from './components/NotificationHistory';
import { useAuth } from '../../auth/AuthProvider';
import { loadUserPreferences, saveUserPreferences } from '../../utils/preferences';

const NotificationSettings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('thresholds');
  const { user } = useAuth();
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [settings, setSettings] = useState({
    // Air Quality Thresholds
    airQuality: {
      enabled: true,
      aqiThreshold: 100,
      pm25Threshold: 35,
      pm10Threshold: 150,
      ozoneThreshold: 70,
      no2Threshold: 100
    },
    // Noise Thresholds
    noise: {
      enabled: true,
      thresholdExceeded: 85,
      prolongedExposure: 75,
      suddenSpike: 95,
      regulationViolation: 90
    },
    // Temperature Thresholds
    temperature: {
      enabled: true,
      heatWarning: 32,
      coldWarning: 5,
      rapidChange: 5
    },
    // Emergency Alerts
    emergency: {
      enabled: true,
      criticalAQI: 300,
      extremeNoise: 100,
      extremeTemp: 40,
      systemFailure: true
    },
    // Notification Channels
    channels: {
      email: true,
      sms: false,
      push: true,
      dashboard: true
    },
    // Frequency Settings
    frequency: {
      immediate: true,
      hourlySummary: false,
      dailyReport: true,
      weeklyDigest: false,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00'
    },
    // Role-based settings
    userRole: 'official'
  });

  // Load user preferences from Supabase
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!user?.id) return;
      setLoadingPrefs(true);
      try {
        const prefs = await loadUserPreferences(user.id);
        if (!mounted || !prefs) {
          setLoadingPrefs(false);
          return;
        }
        // Merge minimal prefs into the full local settings shape
        setSettings((prev) => ({
          ...prev,
          airQuality: {
            ...prev.airQuality,
            aqiThreshold: prefs?.aqi_threshold ?? prev.airQuality.aqiThreshold,
          },
          noise: {
            ...prev.noise,
            thresholdExceeded: prefs?.noise_threshold ?? prev.noise.thresholdExceeded,
          },
          temperature: {
            ...prev.temperature,
            heatWarning: prefs?.temp_threshold ?? prev.temperature.heatWarning,
          },
          channels: {
            ...prev.channels,
            email: prefs?.email_alerts ?? prev.channels.email,
          },
        }));
      } catch (e) {
        console.error('Failed to load preferences:', e?.message || e);
      } finally {
        setLoadingPrefs(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [user?.id]);

  const tabs = [
    { id: 'thresholds', label: 'Alert Thresholds', icon: 'Gauge' },
    { id: 'channels', label: 'Notification Channels', icon: 'Send' },
    { id: 'frequency', label: 'Frequency & Timing', icon: 'Clock' },
    { id: 'history', label: 'Notification History', icon: 'History' }
  ];

  const canSave = useMemo(() => !!user?.id && !loadingPrefs, [user?.id, loadingPrefs]);

  const handleSaveSettings = async () => {
    if (!user?.id) return;
    try {
      const saved = await saveUserPreferences(user.id, settings);
      console.log('Preferences saved:', saved);
    } catch (e) {
      console.error('Failed to save preferences:', e?.message || e);
    }
  };

  const handleTestNotification = () => {
    console.log('Testing notification with current settings');
    // In real implementation, this would trigger a test notification
  };

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notification-settings.json';
    link?.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            {t('notif.title')}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            {t('notif.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={handleExportConfig}
          >
            {t('buttons.export')}
          </Button>
            <Button
            variant="outline"
            iconName="TestTube"
            iconPosition="left"
            onClick={handleTestNotification}
          >
            {t('buttons.alerts')}
          </Button>
            <Button
            variant="default"
            iconName="Save"
            iconPosition="left"
            onClick={handleSaveSettings}
            disabled={!canSave}
          >
            {t('buttons.save')}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-card border border-border rounded-lg p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
        {activeTab === 'thresholds' && (
          <ThresholdConfiguration
            settings={settings}
            onSettingsChange={setSettings}
          />
        )}
        {activeTab === 'channels' && (
          <ChannelConfiguration
            settings={settings}
            onSettingsChange={setSettings}
          />
        )}
        {activeTab === 'frequency' && (
          <FrequencyConfiguration
            settings={settings}
            onSettingsChange={setSettings}
          />
        )}
        {activeTab === 'history' && (
          <NotificationHistory />
        )}
      </div>

      {/* Role-based Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <Icon name="Info" size={20} color="var(--color-primary)" className="mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground mb-1">Role-Based Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Your notification settings are configured for the <span className="font-medium text-foreground">{settings?.userRole}</span> role.
            Different roles may have different default thresholds and alert priorities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;