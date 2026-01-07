import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const AlertConfiguration = ({ onSave }) => {
  const [config, setConfig] = useState({
    heatWarning: 32,
    coldWarning: 5,
    rapidChange: 5,
    enableHeatAlerts: true,
    enableColdAlerts: true,
    enableChangeAlerts: true
  });

  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
          <Icon name="Bell" size={20} color="var(--color-warning)" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Alert Configuration</h3>
          <p className="caption text-muted-foreground">Set temperature thresholds for notifications</p>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <Checkbox
            label="Enable Heat Warnings"
            description="Receive alerts when temperature exceeds threshold"
            checked={config?.enableHeatAlerts}
            onChange={(e) => setConfig({ ...config, enableHeatAlerts: e?.target?.checked })}
            className="mb-3"
          />
          {config?.enableHeatAlerts && (
            <Input
              type="number"
              label="Heat Warning Threshold"
              value={config?.heatWarning}
              onChange={(e) => setConfig({ ...config, heatWarning: e?.target?.value })}
              placeholder="Enter temperature in °C"
              min={25}
              max={50}
            />
          )}
        </div>

        <div>
          <Checkbox
            label="Enable Cold Weather Advisories"
            description="Receive alerts when temperature drops below threshold"
            checked={config?.enableColdAlerts}
            onChange={(e) => setConfig({ ...config, enableColdAlerts: e?.target?.checked })}
            className="mb-3"
          />
          {config?.enableColdAlerts && (
            <Input
              type="number"
              label="Cold Warning Threshold"
              value={config?.coldWarning}
              onChange={(e) => setConfig({ ...config, coldWarning: e?.target?.value })}
              placeholder="Enter temperature in °C"
              min={-10}
              max={15}
            />
          )}
        </div>

        <div>
          <Checkbox
            label="Enable Rapid Change Alerts"
            description="Receive alerts for sudden temperature fluctuations"
            checked={config?.enableChangeAlerts}
            onChange={(e) => setConfig({ ...config, enableChangeAlerts: e?.target?.checked })}
            className="mb-3"
          />
          {config?.enableChangeAlerts && (
            <Input
              type="number"
              label="Temperature Change Threshold"
              value={config?.rapidChange}
              onChange={(e) => setConfig({ ...config, rapidChange: e?.target?.value })}
              placeholder="Enter change in °C per hour"
              min={1}
              max={15}
            />
          )}
        </div>

        <Button
          variant="default"
          iconName="Save"
          iconPosition="left"
          onClick={handleSave}
          fullWidth
        >
          Save Alert Configuration
        </Button>
      </div>
    </div>
  );
};

export default AlertConfiguration;