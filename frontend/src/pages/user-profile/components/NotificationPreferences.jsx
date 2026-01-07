import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const NotificationPreferences = ({ profileData, onProfileChange }) => {
  const handleToggle = (field) => {
    onProfileChange({
      ...profileData,
      [field]: !profileData?.[field]
    });
  };

  const notificationChannels = [
    {
      id: 'emailNotifications',
      label: 'Email Notifications',
      icon: 'Mail',
      description: 'Receive alerts and reports via email',
      color: 'var(--color-primary)'
    },
    {
      id: 'smsNotifications',
      label: 'SMS Notifications',
      icon: 'MessageSquare',
      description: 'Receive urgent alerts via text message',
      color: 'var(--color-success)'
    },
    {
      id: 'pushNotifications',
      label: 'Push Notifications',
      icon: 'Bell',
      description: 'Receive real-time browser notifications',
      color: 'var(--color-warning)'
    }
  ];

  const notificationTypes = [
    {
      id: 'weeklyDigest',
      label: 'Weekly Digest',
      icon: 'Calendar',
      description: 'Receive a weekly summary of environmental data'
    },
    {
      id: 'criticalAlertsOnly',
      label: 'Critical Alerts Only',
      icon: 'AlertTriangle',
      description: 'Only receive notifications for critical events'
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Notification Channels */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Send" size={20} color="var(--color-primary)" />
          Notification Channels
        </h3>
        <div className="space-y-3">
          {notificationChannels?.map((channel) => (
            <div
              key={channel?.id}
              className="bg-muted rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-card rounded-lg">
                  <Icon name={channel?.icon} size={20} color={channel?.color} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{channel?.label}</h4>
                  <p className="text-sm text-muted-foreground">{channel?.description}</p>
                </div>
              </div>
              <Checkbox
                checked={profileData?.[channel?.id]}
                onChange={() => handleToggle(channel?.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Settings" size={20} color="var(--color-primary)" />
          Notification Preferences
        </h3>
        <div className="space-y-3">
          {notificationTypes?.map((type) => (
            <div
              key={type?.id}
              className="bg-muted rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-card rounded-lg">
                  <Icon name={type?.icon} size={20} color="var(--color-primary)" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{type?.label}</h4>
                  <p className="text-sm text-muted-foreground">{type?.description}</p>
                </div>
              </div>
              <Checkbox
                checked={profileData?.[type?.id]}
                onChange={() => handleToggle(type?.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          iconName="BellOff"
          iconPosition="left"
          onClick={() => {
            onProfileChange({
              ...profileData,
              emailNotifications: false,
              smsNotifications: false,
              pushNotifications: false
            });
          }}
        >
          Disable All
        </Button>
        <Button
          variant="outline"
          iconName="Bell"
          iconPosition="left"
          onClick={() => {
            onProfileChange({
              ...profileData,
              emailNotifications: true,
              smsNotifications: false,
              pushNotifications: true
            });
          }}
        >
          Enable Recommended
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <Icon name="Info" size={20} color="var(--color-primary)" className="mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground mb-1">Advanced Settings</h4>
          <p className="text-sm text-muted-foreground">
            For detailed notification configuration including thresholds, frequency, and quiet hours, visit the{' '}
            <a href="/notification-settings" className="text-primary hover:underline font-medium">
              Notification Settings
            </a>{' '}
            page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;