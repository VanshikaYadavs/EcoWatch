import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FrequencyConfiguration = ({ settings, onSettingsChange }) => {
  const updateFrequency = (field, value) => {
    onSettingsChange({
      ...settings,
      frequency: {
        ...settings?.frequency,
        [field]: value
      }
    });
  };

  const frequencyOptions = [
    {
      id: 'immediate',
      label: 'Immediate Alerts',
      icon: 'Zap',
      color: 'var(--color-error)',
      description: 'Receive alerts instantly when thresholds are exceeded',
      recommended: 'Critical and high-priority alerts'
    },
    {
      id: 'hourlySummary',
      label: 'Hourly Summary',
      icon: 'Clock',
      color: 'var(--color-warning)',
      description: 'Receive a summary of all alerts from the past hour',
      recommended: 'Standard monitoring during business hours'
    },
    {
      id: 'dailyReport',
      label: 'Daily Report',
      icon: 'Calendar',
      color: 'var(--color-primary)',
      description: 'Receive a comprehensive daily report with trends and analysis',
      recommended: 'Overview and trend analysis'
    },
    {
      id: 'weeklyDigest',
      label: 'Weekly Digest',
      icon: 'FileText',
      color: 'var(--color-success)',
      description: 'Receive a weekly digest with statistical analysis and insights',
      recommended: 'Long-term planning and compliance'
    }
  ];

  const deliveryTimeOptions = [
    { value: '00:00', label: '12:00 AM' },
    { value: '06:00', label: '6:00 AM' },
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '17:00', label: '5:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '20:00', label: '8:00 PM' }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Frequency Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Alert Frequency</h3>
        {frequencyOptions?.map((option) => (
          <div
            key={option?.id}
            className="border border-border rounded-lg p-4 md:p-6 hover:border-primary/50 transition-smooth"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon name={option?.icon} size={20} color={option?.color} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-semibold text-foreground">{option?.label}</h4>
                    {settings?.frequency?.[option?.id] && (
                      <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{option?.description}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Recommended for:</span> {option?.recommended}
                  </p>
                </div>
              </div>
              <Checkbox
                checked={settings?.frequency?.[option?.id]}
                onChange={(e) => updateFrequency(option?.id, e?.target?.checked)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quiet Hours */}
      <div className="bg-muted rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon name="Moon" size={20} color="var(--color-primary)" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Quiet Hours</h3>
              <p className="text-sm text-muted-foreground">Suppress non-critical alerts during specified hours</p>
            </div>
          </div>
          <Checkbox
            checked={settings?.frequency?.quietHoursEnabled}
            onChange={(e) => updateFrequency('quietHoursEnabled', e?.target?.checked)}
          />
        </div>

        {settings?.frequency?.quietHoursEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Select
              label="Start Time"
              options={deliveryTimeOptions}
              value={settings?.frequency?.quietHoursStart}
              onChange={(value) => updateFrequency('quietHoursStart', value)}
              description="Quiet hours begin at this time"
            />
            <Select
              label="End Time"
              options={deliveryTimeOptions}
              value={settings?.frequency?.quietHoursEnd}
              onChange={(value) => updateFrequency('quietHoursEnd', value)}
              description="Quiet hours end at this time"
            />
          </div>
        )}
      </div>

      {/* Alert Grouping */}
      <div className="bg-muted rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Layers" size={20} color="var(--color-primary)" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Alert Grouping</h3>
            <p className="text-sm text-muted-foreground">Combine similar alerts to reduce notification volume</p>
          </div>
        </div>
        <div className="space-y-3">
          <Checkbox
            label="Group by Location"
            description="Combine alerts from the same monitoring location"
            checked
            onChange={() => {}}
          />
          <Checkbox
            label="Group by Type"
            description="Combine alerts of the same environmental parameter"
            checked
            onChange={() => {}}
          />
          <Checkbox
            label="Group by Severity"
            description="Combine alerts with similar severity levels"
           
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Escalation Rules */}
      <div className="border border-border rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="TrendingUp" size={20} color="var(--color-error)" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Alert Escalation</h3>
            <p className="text-sm text-muted-foreground">Automatically escalate unacknowledged critical alerts</p>
          </div>
        </div>
        <div className="space-y-4">
          <Checkbox
            label="Enable Escalation"
            description="Escalate critical alerts if not acknowledged within specified time"
            checked
            onChange={() => {}}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Escalation Delay (minutes)"
              type="number"
              value={15}
              onChange={() => {}}
              description="Time before escalation"
              min={5}
              max={60}
            />
            <Input
              label="Max Escalation Attempts"
              type="number"
              value={3}
              onChange={() => {}}
              description="Number of escalation attempts"
              min={1}
              max={5}
            />
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} color="var(--color-primary)" className="mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-1">Frequency Best Practices</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Enable immediate alerts for critical environmental conditions</li>
              <li>• Use hourly summaries during active monitoring periods</li>
              <li>• Configure quiet hours to avoid alert fatigue during off-hours</li>
              <li>• Enable escalation for critical alerts requiring immediate response</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrequencyConfiguration;