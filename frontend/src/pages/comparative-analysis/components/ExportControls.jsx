import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExportControls = ({ selectedCities, selectedParameters, timeRange }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const handleExport = (format) => {
    setIsExporting(true);
    setExportFormat(format);

    setTimeout(() => {
      setIsExporting(false);
      alert(`Export completed! Your ${format?.toUpperCase()} report has been generated with data for ${selectedCities?.length} cities and ${selectedParameters?.length} parameters.`);
    }, 2000);
  };

  const cityNames = {
    jaipur: 'Jaipur',
    jodhpur: 'Jodhpur',
    udaipur: 'Udaipur',
    kota: 'Kota',
    ajmer: 'Ajmer',
    bikaner: 'Bikaner',
    alwar: 'Alwar',
    bharatpur: 'Bharatpur',
    sikar: 'Sikar',
    pali: 'Pali',
    tonk: 'Tonk',
    bhilwara: 'Bhilwara'
  };

  const isExportDisabled = selectedCities?.length === 0 || selectedParameters?.length === 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Download" size={20} color="var(--color-primary)" />
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          Export Analysis
        </h3>
      </div>
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h4 className="text-xs md:text-sm font-semibold text-foreground mb-3">
            Export Summary
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Selected Cities:</span>
              <span className="font-data font-medium text-foreground">
                {selectedCities?.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Parameters:</span>
              <span className="font-data font-medium text-foreground">
                {selectedParameters?.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Time Range:</span>
              <span className="font-data font-medium text-foreground">
                {timeRange === '24h' ? '24 Hours' : timeRange === '7d' ? '7 Days' : timeRange === '30d' ? '30 Days' : '90 Days'}
              </span>
            </div>
          </div>
        </div>

        {selectedCities?.length > 0 && (
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <h4 className="text-xs md:text-sm font-semibold text-foreground mb-2">
              Cities Included:
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedCities?.map(cityId => (
                <span 
                  key={cityId}
                  className="px-2 py-1 text-xs font-medium text-foreground bg-primary/10 rounded-full"
                >
                  {cityNames?.[cityId]}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="default"
            iconName="FileText"
            iconPosition="left"
            onClick={() => handleExport('pdf')}
            disabled={isExportDisabled}
            loading={isExporting && exportFormat === 'pdf'}
            fullWidth
          >
            Export as PDF
          </Button>

          <Button
            variant="outline"
            iconName="Table"
            iconPosition="left"
            onClick={() => handleExport('csv')}
            disabled={isExportDisabled}
            loading={isExporting && exportFormat === 'csv'}
            fullWidth
          >
            Export as CSV
          </Button>
        </div>

        {isExportDisabled && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <Icon name="AlertCircle" size={16} color="var(--color-warning)" className="mt-0.5 flex-shrink-0" />
            <p className="text-xs md:text-sm text-warning">
              Please select at least one city and one parameter to enable export functionality.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <p className="text-xs font-caption text-muted-foreground text-center">
            Exported reports include charts, statistical summaries, and detailed data tables
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExportControls;