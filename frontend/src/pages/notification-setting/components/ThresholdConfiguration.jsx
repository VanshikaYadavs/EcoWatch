import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ThresholdConfiguration = ({ settings, onSettingsChange }) => {
  const [expandedSection, setExpandedSection] = useState('airQuality');

  const userRoleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'official', label: 'Government Official' },
    { value: 'leader', label: 'Community Leader' },
    { value: 'health', label: 'Health Official' },
    { value: 'responder', label: 'Emergency Responder' },
    { value: 'analyst', label: 'Data Analyst' },
    { value: 'researcher', label: 'Researcher' }
  ];

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const updateThreshold = (category, field, value) => {
    onSettingsChange({
      ...settings,
      [category]: {
        ...settings?.[category],
        [field]: value
      }
    });
  };

  const sections = [
    {
      id: 'airQuality',
      title: 'Air Quality Alerts',
      icon: 'Wind',
      color: 'var(--color-primary)',
      fields: [
        { key: 'aqiThreshold', label: 'AQI Threshold', description: 'Alert when AQI exceeds this value', min: 0, max: 500 },
        { key: 'pm25Threshold', label: 'PM2.5 Threshold (µg/m³)', description: 'Fine particulate matter limit', min: 0, max: 500 },
        { key: 'pm10Threshold', label: 'PM10 Threshold (µg/m³)', description: 'Coarse particulate matter limit', min: 0, max: 600 },
        { key: 'ozoneThreshold', label: 'Ozone Threshold (ppb)', description: 'Ground-level ozone limit', min: 0, max: 200 },
        { key: 'no2Threshold', label: 'NO₂ Threshold (ppb)', description: 'Nitrogen dioxide limit', min: 0, max: 200 }
      ]
    },
    {
      id: 'noise',
      title: 'Noise Level Alerts',
      icon: 'Volume2',
      color: 'var(--color-warning)',
      fields: [
        { key: 'thresholdExceeded', label: 'Standard Threshold (dB)', description: 'Alert when noise exceeds this level', min: 0, max: 120 },
        { key: 'prolongedExposure', label: 'Prolonged Exposure (dB)', description: 'Alert for sustained high noise', min: 0, max: 100 },
        { key: 'suddenSpike', label: 'Sudden Spike (dB)', description: 'Alert on rapid noise increase', min: 0, max: 140 },
        { key: 'regulationViolation', label: 'Regulation Violation (dB)', description: 'Municipal regulation threshold', min: 0, max: 120 }
      ]
    },
    {
      id: 'temperature',
      title: 'Temperature Alerts',
      icon: 'Thermometer',
      color: 'var(--color-error)',
      fields: [
        { key: 'heatWarning', label: 'Heat Warning (°C)', description: 'Alert when temperature exceeds', min: 25, max: 50 },
        { key: 'coldWarning', label: 'Cold Warning (°C)', description: 'Alert when temperature drops below', min: -10, max: 15 },
        { key: 'rapidChange', label: 'Rapid Change (°C/hr)', description: 'Alert on sudden temperature shift', min: 1, max: 15 }
      ]
    },
    {
      id: 'emergency',
      title: 'Emergency Alerts',
      icon: 'AlertTriangle',
      color: 'var(--color-error)',
      fields: [
        { key: 'criticalAQI', label: 'Critical AQI Level', description: 'Hazardous air quality threshold', min: 200, max: 500 },
        { key: 'extremeNoise', label: 'Extreme Noise (dB)', description: 'Dangerous noise level', min: 100, max: 140 },
        { key: 'extremeTemp', label: 'Extreme Temperature (°C)', description: 'Life-threatening temperature', min: 35, max: 55 }
      ]
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Role Selection */}
      <div className="bg-muted rounded-lg p-4 mb-6">
        <Select
          label="User Role"
          options={userRoleOptions}
          value={settings?.userRole}
          onChange={(value) => onSettingsChange({ ...settings, userRole: value })}
          description="Select your role for role-based default thresholds"
        />
      </div>

      {/* Threshold Sections */}
      {sections?.map((section) => (
        <div key={section?.id} className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection(section?.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-smooth"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Icon name={section?.icon} size={20} color={section?.color} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-foreground">{section?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {settings?.[section?.id]?.enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={settings?.[section?.id]?.enabled}
                onChange={(e) => {
                  e?.stopPropagation();
                  updateThreshold(section?.id, 'enabled', e?.target?.checked);
                }}
                onClick={(e) => e?.stopPropagation()}
              />
              <Icon
                name={expandedSection === section?.id ? 'ChevronUp' : 'ChevronDown'}
                size={20}
                color="var(--color-muted-foreground)"
              />
            </div>
          </button>

          {expandedSection === section?.id && settings?.[section?.id]?.enabled && (
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section?.fields?.map((field) => (
                  <Input
                    key={field?.key}
                    label={field?.label}
                    type="number"
                    value={settings?.[section?.id]?.[field?.key]}
                    onChange={(e) => updateThreshold(section?.id, field?.key, e?.target?.value)}
                    description={field?.description}
                    min={field?.min}
                    max={field?.max}
                  />
                ))}
                {section?.id === 'emergency' && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <Checkbox
                      label="System Failure Alerts"
                      description="Receive alerts when monitoring systems fail or go offline"
                      checked={settings?.emergency?.systemFailure}
                      onChange={(e) => updateThreshold('emergency', 'systemFailure', e?.target?.checked)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ThresholdConfiguration;