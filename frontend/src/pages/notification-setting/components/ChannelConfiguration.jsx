import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { useTranslation } from 'react-i18next';

const ChannelConfiguration = ({ settings, onSettingsChange }) => {
  const { t } = useTranslation();
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
      label: t('notif.channel.email.label'),
      icon: 'Mail',
      color: 'var(--color-primary)',
      description: t('notif.channel.email.desc'),
      features: ['Detailed alert information', 'Attached reports and charts', 'Customizable templates', 'Delivery confirmation']
    },
    {
      id: 'sms',
      label: t('notif.channel.sms.label'),
      icon: 'MessageSquare',
      color: 'var(--color-success)',
      description: t('notif.channel.sms.desc'),
      features: ['Instant delivery', 'Critical alerts only', 'No internet required', 'Character limit: 160']
    },
    {
      id: 'push',
      label: t('notif.channel.push.label'),
      icon: 'Bell',
      color: 'var(--color-warning)',
      description: t('notif.channel.push.desc'),
      features: ['Real-time delivery', 'Interactive actions', 'Works when app is closed', 'Requires browser permission']
    },
    {
      id: 'dashboard',
      label: t('notif.channel.dashboard.label'),
      icon: 'LayoutDashboard',
      color: 'var(--color-error)',
      description: t('notif.channel.dashboard.desc'),
      features: ['Always visible', 'Persistent until dismissed', 'Visual indicators', 'Quick access to details']
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Contact Information */}
      <div className="bg-muted rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="User" size={20} color="var(--color-primary)" />
          {t('notif.contact.title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              label={t('notif.contact.email.label')}
              type="email"
              value={contactInfo?.email}
              onChange={(e) => setContactInfo({ ...contactInfo, email: e?.target?.value })}
              description={contactInfo?.verified?.email ? t('notif.contact.verified') : t('notif.contact.notVerified')}
            />
            {!contactInfo?.verified?.email && (
              <Button
                variant="outline"
                size="sm"
                iconName="CheckCircle"
                iconPosition="left"
                onClick={() => handleVerifyContact('email')}
              >
                {t('notif.contact.verifyEmail')}
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <Input
              label={t('notif.contact.phone.label')}
              type="tel"
              value={contactInfo?.phone}
              onChange={(e) => setContactInfo({ ...contactInfo, phone: e?.target?.value })}
              description={contactInfo?.verified?.phone ? t('notif.contact.verified') : t('notif.contact.notVerified')}
            />
            {!contactInfo?.verified?.phone && (
              <Button
                variant="outline"
                size="sm"
                iconName="CheckCircle"
                iconPosition="left"
                onClick={() => handleVerifyContact('phone')}
              >
                {t('notif.contact.verifyPhone')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t('notif.channel.title')}</h3>
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
                        {t('notif.channel.active')}
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
                <h5 className="text-sm font-medium text-foreground mb-2">{t('notif.channel.features')}</h5>
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
            <h4 className="font-semibold text-foreground mb-1">{t('notif.channel.priority.title')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('notif.channel.priority.desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelConfiguration;