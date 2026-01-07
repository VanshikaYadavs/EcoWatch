import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReportTemplates = ({ onSelectTemplate }) => {
  const templates = [
    {
      id: 'monthly-compliance',
      name: 'Monthly Compliance Report',
      description: 'Standard regulatory compliance documentation for monthly submission',
      icon: 'FileCheck',
      color: '#059669',
      parameters: ['AQI', 'Noise', 'Temperature', 'Humidity'],
      frequency: 'Monthly',
      lastUsed: '12/15/2025'
    },
    {
      id: 'annual-assessment',
      name: 'Annual Environmental Assessment',
      description: 'Comprehensive yearly overview of environmental conditions and trends',
      icon: 'Calendar',
      color: '#3B82F6',
      parameters: ['All Parameters', 'Hotspots', 'Trends'],
      frequency: 'Yearly',
      lastUsed: '01/01/2026'
    },
    {
      id: 'incident-analysis',
      name: 'Incident Analysis Report',
      description: 'Detailed investigation of specific environmental events or threshold breaches',
      icon: 'AlertTriangle',
      color: '#DC2626',
      parameters: ['Event-specific', 'Root Cause', 'Impact'],
      frequency: 'As Needed',
      lastUsed: '12/28/2025'
    },
    {
      id: 'quarterly-trends',
      name: 'Quarterly Trend Analysis',
      description: 'Seasonal pattern analysis and comparative quarterly performance',
      icon: 'TrendingUp',
      color: '#D97706',
      parameters: ['Trends', 'Comparisons', 'Forecasts'],
      frequency: 'Quarterly',
      lastUsed: '12/31/2025'
    },
    {
      id: 'public-summary',
      name: 'Public Summary Report',
      description: 'Citizen-friendly environmental quality summary for public distribution',
      icon: 'Users',
      color: '#8B5CF6',
      parameters: ['AQI', 'Key Metrics', 'Health Impact'],
      frequency: 'Weekly',
      lastUsed: '01/03/2026'
    },
    {
      id: 'emergency-response',
      name: 'Emergency Response Report',
      description: 'Rapid assessment for emergency situations requiring immediate action',
      icon: 'Siren',
      color: '#EF4444',
      parameters: ['Critical Levels', 'Affected Areas', 'Actions'],
      frequency: 'Emergency',
      lastUsed: '11/22/2025'
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
          <Icon name="LayoutTemplate" size={20} color="var(--color-secondary)" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">Report Templates</h2>
          <p className="text-sm text-muted-foreground mt-1">Pre-configured reports for common use cases</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {templates?.map((template) => (
          <div key={template?.id} className="bg-muted rounded-lg p-4 md:p-6 transition-smooth hover:shadow-md border border-transparent hover:border-border">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${template?.color}20` }}>
                <Icon name={template?.icon} size={20} color={template?.color} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-foreground line-clamp-2">{template?.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template?.description}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <Icon name="Layers" size={14} color="var(--color-muted-foreground)" />
                <span className="text-sm text-muted-foreground">Parameters:</span>
                <span className="text-sm font-medium text-foreground">{template?.parameters?.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={14} color="var(--color-muted-foreground)" />
                <span className="text-sm text-muted-foreground">Frequency:</span>
                <span className="text-sm font-medium text-foreground">{template?.frequency}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={14} color="var(--color-muted-foreground)" />
                <span className="text-sm text-muted-foreground">Last Used:</span>
                <span className="text-sm font-medium text-foreground">{template?.lastUsed}</span>
              </div>
            </div>

            <Button
              variant="outline"
              iconName="FileDown"
              iconPosition="left"
              onClick={() => onSelectTemplate(template)}
              fullWidth
            >
              Use Template
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportTemplates;