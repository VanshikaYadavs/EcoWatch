import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ChannelConfiguration = ({ settings, onSettingsChange }) => {
  const [contactInfo, setContactInfo] = useState({
    email: 'user@example.com',
    phone: '+1234567890',
    verified: {
      email: true,
      phone: false
    }
  });

  const updateChannel = (channel, value) => {
    onSettingsChange({
      ...settings,
      channels: {
        ...settings?.channels,
        [channel]: value
      }
    });
  };

  const handleVerifyContact = (type) => {
    console.log(`Verifying ${type}:`, contactInfo?.[type]);
    // In real implementation, this would trigger verification flow
  };

  const handleTestChannel = (channel) => {
    console.log(`Testing ${channel} notification`);
    // In real implementation, this would send a test notification
  };

  const channels = [
    {
      id: 'email',
      label: 'Email Notifications',
      icon: 'Mail',
      color: 'var(--color-primary)',
      description: 'Receive detailed alerts and reports via email',
      features: ['Detailed alert information', 'Attached reports and charts', 'Customizable templates', 'Delivery confirmation']
    },
    {
      id: 'sms',
      label: 'SMS Notifications',
      icon: 'MessageSquare',
      color: 'var(--color-success)',
      description: 'Receive urgent alerts via text message',
      features: ['Instant delivery', 'Critical alerts only', 'No internet required', 'Character limit: 160']
    },
    {
      id: 'push',
      label: 'Push Notifications',
      icon: 'Bell',
      color: 'var(--color-warning)',
      description: 'Receive real-time browser notifications',
      features: ['Real-time delivery', 'Interactive actions', 'Works when app is closed', 'Requires browser permission']
    },
    {
      id: 'dashboard',
      label: 'Dashboard Alerts',
      icon: 'LayoutDashboard',
      color: 'var(--color-error)',
      description: 'Display alerts on the main dashboard',
      features: ['Always visible', 'Persistent until dismissed', 'Visual indicators', 'Quick access to details']
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Contact Information */}
      <div className="bg-muted rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="User" size={20} color="var(--color-primary)" />
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              label="Email Address"
              type="email"
              value={contactInfo?.email}
              onChange={(e) => setContactInfo({ ...contactInfo, email: e?.target?.value })}
              description={contactInfo?.verified?.email ? '✓ Verified' : 'Not verified'}
            />
            {!contactInfo?.verified?.email && (
              <Button
                variant="outline"
                size="sm"
                iconName="CheckCircle"
                iconPosition="left"
                onClick={() => handleVerifyContact('email')}
              >
                Verify Email
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <Input
              label="Phone Number"
              type="tel"
              value={contactInfo?.phone}
              onChange={(e) => setContactInfo({ ...contactInfo, phone: e?.target?.value })}
              description={contactInfo?.verified?.phone ? '✓ Verified' : 'Not verified'}
            />
            {!contactInfo?.verified?.phone && (
              <Button
                variant="outline"
                size="sm"
                iconName="CheckCircle"
                iconPosition="left"
                onClick={() => handleVerifyContact('phone')}
              >
                Verify Phone
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Notification Channels</h3>
        {channels?.map((channel) => (
          <div
            key={channel?.id}
            className="border border-border rounded-lg p-4 md:p-6 hover:border-primary/50 transition-smooth"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon name={channel?.icon} size={20} color={channel?.color} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-semibold text-foreground">{channel?.label}</h4>
                    {settings?.channels?.[channel?.id] && (
                      <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{channel?.description}</p>
                </div>
              </div>
              <Checkbox
                checked={settings?.channels?.[channel?.id]}
                onChange={(e) => updateChannel(channel?.id, e?.target?.checked)}
              />
            </div>

            {settings?.channels?.[channel?.id] && (
              <div className="mt-4 pt-4 border-t border-border">
                <h5 className="text-sm font-medium text-foreground mb-2">Features:</h5>
                <ul className="space-y-1 mb-4">
                  {channel?.features?.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <Icon name="Check" size={14} color="var(--color-success)" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="TestTube"
                  iconPosition="left"
                  onClick={() => handleTestChannel(channel?.id)}
                >
                  Test {channel?.label}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Channel Priority */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} color="var(--color-primary)" className="mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-1">Channel Priority</h4>
            <p className="text-sm text-muted-foreground">
              Critical alerts will be sent through all enabled channels. Standard alerts will use email and dashboard only.
              SMS notifications are reserved for high-priority and critical alerts to avoid message overload.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelConfiguration;