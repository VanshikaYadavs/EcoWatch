import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const AlertConfiguration = ({ onSave }) => {
  const [config, setConfig] = useState({
    aqiThreshold: 100,
    pm25Threshold: 35,
    pm10Threshold: 150,
    ozoneThreshold: 70,
    no2Threshold: 100,
    notifyEmail: true,
    notifySMS: false,
    notifyPush: true,
    userRole: 'official'
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const { t, i18n } = useTranslation();

  // Debug: Log current language and translation
  console.log('AlertConfiguration - Current language:', i18n.language);
  console.log('AlertConfiguration - alert.title translation:', t('alert.title'));
  console.log('AlertConfiguration - Direct access to resources:', i18n.options.resources.en.translation['alert.title']);
  console.log('AlertConfiguration - All loaded languages:', Object.keys(i18n.options.resources));

  const userRoleOptions = [
    { value: 'admin', label: t('alert.roles.admin') },
    { value: 'official', label: t('alert.roles.official') },
    { value: 'leader', label: t('alert.roles.leader') },
    { value: 'health', label: t('alert.roles.health') },
    { value: 'responder', label: t('alert.roles.responder') }
  ];

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-muted/50 transition-smooth"
      >
        <div className="flex items-center gap-3">
          <Icon name="Bell" size={24} color="var(--color-primary)" />
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">{t('alert.title')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('alert.subtitle')}</p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={24} 
          color="var(--color-muted-foreground)"
        />
      </button>
      {isExpanded && (
        <div className="p-4 md:p-6 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Input
              label={t('alert.input.aqi')}
              type="number"
              value={config?.aqiThreshold}
              onChange={(e) => setConfig({ ...config, aqiThreshold: e?.target?.value })}
              description={t('alert.input.description.aqi')}
              min={0}
              max={500}
            />

            <Input
              label={t('alert.input.pm25')}
              type="number"
              value={config?.pm25Threshold}
              onChange={(e) => setConfig({ ...config, pm25Threshold: e?.target?.value })}
              description={t('alert.input.description.pm25')}
              min={0}
            />

            <Input
              label={t('alert.input.pm10')}
              type="number"
              value={config?.pm10Threshold}
              onChange={(e) => setConfig({ ...config, pm10Threshold: e?.target?.value })}
              description={t('alert.input.description.pm10')}
              min={0}
            />

            <Input
              label={t('alert.input.ozone')}
              type="number"
              value={config?.ozoneThreshold}
              onChange={(e) => setConfig({ ...config, ozoneThreshold: e?.target?.value })}
              description={t('alert.input.description.ozone')}
              min={0}
            />

            <Input
              label={t('alert.input.no2')}
              type="number"
              value={config?.no2Threshold}
              onChange={(e) => setConfig({ ...config, no2Threshold: e?.target?.value })}
              description={t('alert.input.description.no2')}
              min={0}
            />

            <Select
              label={t('alert.input.userRole') || t('alert.notification.title')}
              options={userRoleOptions}
              value={config?.userRole}
              onChange={(value) => setConfig({ ...config, userRole: value })}
              description={t('alert.input.userRoleDesc') || t('alert.input.userRole')}
            />
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('alert.notification.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Checkbox
                label={t('alert.notify.email')}
                description={t('alert.notify.email.desc')}
                checked={config?.notifyEmail}
                onChange={(e) => setConfig({ ...config, notifyEmail: e?.target?.checked })}
              />

              <Checkbox
                label={t('alert.notify.sms')}
                description={t('alert.notify.sms.desc')}
                checked={config?.notifySMS}
                onChange={(e) => setConfig({ ...config, notifySMS: e?.target?.checked })}
              />

              <Checkbox
                label={t('alert.notify.push')}
                description={t('alert.notify.push.desc')}
                checked={config?.notifyPush}
                onChange={(e) => setConfig({ ...config, notifyPush: e?.target?.checked })}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-border">
            <Button
              variant="default"
              iconName="Save"
              iconPosition="left"
              onClick={handleSave}
            >
              {t('alert.button.save')}
            </Button>
            <Button
              variant="outline"
              iconName="TestTube"
              iconPosition="left"
            >
              {t('alert.button.test')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertConfiguration;