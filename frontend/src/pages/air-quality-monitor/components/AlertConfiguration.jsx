import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

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

  const userRoleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'official', label: 'Government Official' },
    { value: 'leader', label: 'Community Leader' },
    { value: 'health', label: 'Health Official' },
    { value: 'responder', label: 'Emergency Responder' }
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
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">Alert Configuration</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Set thresholds and notification preferences
            </p>
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
              label="AQI Threshold"
              type="number"
              value={config?.aqiThreshold}
              onChange={(e) => setConfig({ ...config, aqiThreshold: e?.target?.value })}
              description="Alert when AQI exceeds this value"
              min={0}
              max={500}
            />

            <Input
              label="PM2.5 Threshold (µg/m³)"
              type="number"
              value={config?.pm25Threshold}
              onChange={(e) => setConfig({ ...config, pm25Threshold: e?.target?.value })}
              description="Fine particulate matter limit"
              min={0}
            />

            <Input
              label="PM10 Threshold (µg/m³)"
              type="number"
              value={config?.pm10Threshold}
              onChange={(e) => setConfig({ ...config, pm10Threshold: e?.target?.value })}
              description="Coarse particulate matter limit"
              min={0}
            />

            <Input
              label="Ozone Threshold (ppb)"
              type="number"
              value={config?.ozoneThreshold}
              onChange={(e) => setConfig({ ...config, ozoneThreshold: e?.target?.value })}
              description="Ground-level ozone limit"
              min={0}
            />

            <Input
              label="NO₂ Threshold (ppb)"
              type="number"
              value={config?.no2Threshold}
              onChange={(e) => setConfig({ ...config, no2Threshold: e?.target?.value })}
              description="Nitrogen dioxide limit"
              min={0}
            />

            <Select
              label="User Role"
              options={userRoleOptions}
              value={config?.userRole}
              onChange={(value) => setConfig({ ...config, userRole: value })}
              description="Role-based alert priority"
            />
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Checkbox
                label="Email Notifications"
                description="Receive alerts via email"
                checked={config?.notifyEmail}
                onChange={(e) => setConfig({ ...config, notifyEmail: e?.target?.checked })}
              />

              <Checkbox
                label="SMS Notifications"
                description="Receive alerts via SMS"
                checked={config?.notifySMS}
                onChange={(e) => setConfig({ ...config, notifySMS: e?.target?.checked })}
              />

              <Checkbox
                label="Push Notifications"
                description="Receive browser push alerts"
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
              Save Configuration
            </Button>
            <Button
              variant="outline"
              iconName="TestTube"
              iconPosition="left"
            >
              Test Alerts
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertConfiguration;