import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ExportReports = ({ exportSettings, onSettingsChange, onExport }) => {
  const reportTypeOptions = [
    { value: 'compliance', label: 'Compliance Report', description: 'Regulatory submission format' },
    { value: 'community', label: 'Community Notification', description: 'Public-facing summary' },
    { value: 'detailed', label: 'Detailed Analysis', description: 'Complete data export' },
    { value: 'summary', label: 'Executive Summary', description: 'High-level overview' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV Data File' },
    { value: 'json', label: 'JSON Data' }
  ];

  const timeRangeOptions = [
    { value: 'last24h', label: 'Last 24 Hours' },
    { value: 'last7d', label: 'Last 7 Days' },
    { value: 'last30d', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8 shadow-md">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Icon name="Download" size={24} color="var(--color-accent)" />
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
          Export Reports
        </h2>
      </div>
      <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
        Generate compliance reports for regulatory submissions and community notifications
      </p>
      <div className="space-y-4 md:space-y-6">
        <Select
          label="Report Type"
          description="Select the type of report to generate"
          options={reportTypeOptions}
          value={exportSettings?.reportType}
          onChange={(value) => onSettingsChange('reportType', value)}
        />

        <Select
          label="Export Format"
          description="Choose the file format for export"
          options={formatOptions}
          value={exportSettings?.format}
          onChange={(value) => onSettingsChange('format', value)}
        />

        <Select
          label="Time Range"
          description="Select the data period to include"
          options={timeRangeOptions}
          value={exportSettings?.timeRange}
          onChange={(value) => onSettingsChange('timeRange', value)}
        />

        <div className="bg-muted rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-medium text-foreground mb-3 md:mb-4">
            Report Preview
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Report Type:</span>
              <span className="font-medium text-foreground">
                {reportTypeOptions?.find(opt => opt?.value === exportSettings?.reportType)?.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Format:</span>
              <span className="font-medium text-foreground">
                {formatOptions?.find(opt => opt?.value === exportSettings?.format)?.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Time Range:</span>
              <span className="font-medium text-foreground">
                {timeRangeOptions?.find(opt => opt?.value === exportSettings?.timeRange)?.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Generated:</span>
              <span className="font-medium text-foreground">
                {new Date()?.toLocaleDateString()} {new Date()?.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 rounded-lg p-4 md:p-6 border border-primary/20">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-sm md:text-base font-medium text-foreground mb-1">
                Report Contents
              </h3>
              <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
                <li>• Real-time and historical noise level data</li>
                <li>• Threshold compliance analysis</li>
                <li>• Location-specific measurements</li>
                <li>• Frequency analysis and source identification</li>
                <li>• Alert history and response times</li>
                <li>• Statistical summaries and trends</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="default"
            iconName="Download"
            iconPosition="left"
            onClick={onExport}
            fullWidth
          >
            Generate & Download Report
          </Button>
          <Button
            variant="outline"
            iconName="Eye"
            iconPosition="left"
            onClick={() => {}}
            fullWidth
          >
            Preview Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportReports;