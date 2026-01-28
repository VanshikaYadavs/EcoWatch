import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const ReportBuilder = ({ onGenerateReport }) => {
  const [reportConfig, setReportConfig] = useState({
    reportType: '',
    dateRange: 'last30days',
    startDate: '',
    endDate: '',
    locations: [],
    parameters: [],
    format: 'pdf',
    includeCharts: true,
    includeStatistics: true,
    includeRecommendations: false
  });

  const reportTypes = [
    { value: 'compliance', label: 'Monthly Compliance Report', description: 'Regulatory compliance documentation' },
    { value: 'annual', label: 'Annual Environmental Assessment', description: 'Yearly environmental overview' },
    { value: 'incident', label: 'Incident Analysis Report', description: 'Specific event investigation' },
    { value: 'trend', label: 'Trend Analysis Report', description: 'Long-term pattern analysis' },
    { value: 'comparison', label: 'Comparative Analysis', description: 'Multi-location comparison' },
    { value: 'custom', label: 'Custom Report', description: 'Build your own report' }
  ];

  const dateRangeOptions = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'last6months', label: 'Last 6 Months' },
    { value: 'lastyear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const locationOptions = [
    { value: 'jaipur', label: 'Jaipur City' },
    { value: 'tonk', label: 'Tonk District' },
    { value: 'udaipur', label: 'Udaipur City' },
    { value: 'jodhpur', label: 'Jodhpur City' },
    { value: 'ajmer', label: 'Ajmer City' },
    { value: 'bikaner', label: 'Bikaner City' },
    { value: 'all', label: 'All Locations' }
  ];

  const parameterOptions = [
    { value: 'aqi', label: 'Air Quality Index (AQI)' },
    { value: 'noise', label: 'Noise Levels' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'humidity', label: 'Humidity' },
    { value: 'hotspots', label: 'Environmental Hotspots' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV Data File' },
    { value: 'json', label: 'JSON Data' }
  ];

  const handleConfigChange = (field, value) => {
    setReportConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    if (!reportConfig?.reportType || reportConfig?.locations?.length === 0 || reportConfig?.parameters?.length === 0) {
      return;
    }
    onGenerateReport(reportConfig);
  };

  const isFormValid = reportConfig?.reportType && reportConfig?.locations?.length > 0 && reportConfig?.parameters?.length > 0;

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name="FileText" size={20} color="var(--color-primary)" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">Report Builder</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure and generate environmental reports</p>
        </div>
      </div>
      <div className="space-y-6">
        <Select
          label="Report Type"
          description="Select the type of report you want to generate"
          required
          options={reportTypes}
          value={reportConfig?.reportType}
          onChange={(value) => handleConfigChange('reportType', value)}
          placeholder="Choose report type"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Select
            label="Date Range"
            required
            options={dateRangeOptions}
            value={reportConfig?.dateRange}
            onChange={(value) => handleConfigChange('dateRange', value)}
          />

          <Select
            label="Output Format"
            required
            options={formatOptions}
            value={reportConfig?.format}
            onChange={(value) => handleConfigChange('format', value)}
          />
        </div>

        {reportConfig?.dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <Input
              label="Start Date"
              type="date"
              value={reportConfig?.startDate}
              onChange={(e) => handleConfigChange('startDate', e?.target?.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={reportConfig?.endDate}
              onChange={(e) => handleConfigChange('endDate', e?.target?.value)}
              required
            />
          </div>
        )}

        <Select
          label="Locations"
          description="Select one or more monitoring locations"
          required
          multiple
          searchable
          clearable
          options={locationOptions}
          value={reportConfig?.locations}
          onChange={(value) => handleConfigChange('locations', value)}
          placeholder="Select locations"
        />

        <Select
          label="Environmental Parameters"
          description="Choose parameters to include in the report"
          required
          multiple
          searchable
          options={parameterOptions}
          value={reportConfig?.parameters}
          onChange={(value) => handleConfigChange('parameters', value)}
          placeholder="Select parameters"
        />

        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium text-foreground">Report Options</p>
          <div className="space-y-3">
            <Checkbox
              label="Include Charts and Visualizations"
              description="Add graphical representations of data"
              checked={reportConfig?.includeCharts}
              onChange={(e) => handleConfigChange('includeCharts', e?.target?.checked)}
            />
            <Checkbox
              label="Include Statistical Analysis"
              description="Add averages, peaks, and correlations"
              checked={reportConfig?.includeStatistics}
              onChange={(e) => handleConfigChange('includeStatistics', e?.target?.checked)}
            />
            <Checkbox
              label="Include Recommendations"
              description="Add AI-generated insights and suggestions"
              checked={reportConfig?.includeRecommendations}
              onChange={(e) => handleConfigChange('includeRecommendations', e?.target?.checked)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="default"
            iconName="FileDown"
            iconPosition="left"
            onClick={handleGenerate}
            disabled={!isFormValid}
            fullWidth
            className="sm:flex-1"
          >
            Generate Report
          </Button>
          <Button
            variant="outline"
            iconName="Save"
            iconPosition="left"
            fullWidth
            className="sm:w-auto"
          >
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;

