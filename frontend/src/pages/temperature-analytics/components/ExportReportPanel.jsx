import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ExportReportPanel = ({ onExport }) => {
  const [exportConfig, setExportConfig] = useState({
    format: 'pdf',
    period: 'monthly',
    includeCharts: true,
    includeStatistics: true,
    includeAlerts: true,
    includeComparison: false
  });

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', description: 'Formatted report with charts' },
    { value: 'excel', label: 'Excel Spreadsheet', description: 'Raw data for analysis' },
    { value: 'csv', label: 'CSV File', description: 'Comma-separated values' },
    { value: 'json', label: 'JSON Data', description: 'Structured data format' }
  ];

  const periodOptions = [
    { value: 'daily', label: 'Daily Report' },
    { value: 'weekly', label: 'Weekly Summary' },
    { value: 'monthly', label: 'Monthly Analysis' },
    { value: 'quarterly', label: 'Quarterly Review' },
    { value: 'yearly', label: 'Annual Report' }
  ];

  const handleExport = () => {
    if (onExport) {
      onExport(exportConfig);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
          <Icon name="Download" size={20} color="var(--color-success)" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Export Climate Report</h3>
          <p className="caption text-muted-foreground">Generate reports for planning and analysis</p>
        </div>
      </div>
      <div className="space-y-4">
        <Select
          label="Report Format"
          options={formatOptions}
          value={exportConfig?.format}
          onChange={(value) => setExportConfig({ ...exportConfig, format: value })}
        />

        <Select
          label="Time Period"
          options={periodOptions}
          value={exportConfig?.period}
          onChange={(value) => setExportConfig({ ...exportConfig, period: value })}
        />

        <div className="space-y-3 pt-2">
          <p className="text-sm font-medium text-foreground">Include in Report:</p>
          
          <Checkbox
            label="Temperature Charts"
            description="Visual representations of temperature trends"
            checked={exportConfig?.includeCharts}
            onChange={(e) => setExportConfig({ ...exportConfig, includeCharts: e?.target?.checked })}
          />

          <Checkbox
            label="Statistical Analysis"
            description="Mean, median, variance, and distribution data"
            checked={exportConfig?.includeStatistics}
            onChange={(e) => setExportConfig({ ...exportConfig, includeStatistics: e?.target?.checked })}
          />

          <Checkbox
            label="Alert History"
            description="Record of temperature warnings and advisories"
            checked={exportConfig?.includeAlerts}
            onChange={(e) => setExportConfig({ ...exportConfig, includeAlerts: e?.target?.checked })}
          />

          <Checkbox
            label="Location Comparison"
            description="Comparative analysis between monitoring zones"
            checked={exportConfig?.includeComparison}
            onChange={(e) => setExportConfig({ ...exportConfig, includeComparison: e?.target?.checked })}
          />
        </div>

        <Button
          variant="default"
          iconName="FileDown"
          iconPosition="left"
          onClick={handleExport}
          fullWidth
          className="mt-6"
        >
          Generate Report
        </Button>
      </div>
    </div>
  );
};

export default ExportReportPanel;