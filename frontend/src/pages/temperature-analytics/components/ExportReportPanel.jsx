import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { useTranslation } from 'react-i18next';

const ExportReportPanel = ({ onExport }) => {
  const { t } = useTranslation();
  const [exportConfig, setExportConfig] = useState({
    format: 'pdf',
    period: 'monthly',
    includeCharts: true,
    includeStatistics: true,
    includeAlerts: true,
    includeComparison: false
  });

  const formatOptions = [
    { value: 'pdf', label: t('temp.export.format.pdf'), description: t('temp.export.format.pdf.desc') },
    { value: 'excel', label: t('temp.export.format.excel'), description: t('temp.export.format.excel.desc') },
    { value: 'csv', label: t('temp.export.format.csv'), description: t('temp.export.format.csv.desc') },
    { value: 'json', label: t('temp.export.format.json'), description: t('temp.export.format.json.desc') }
  ];

  const periodOptions = [
    { value: 'daily', label: t('temp.export.period.daily') },
    { value: 'weekly', label: t('temp.export.period.weekly') },
    { value: 'monthly', label: t('temp.export.period.monthly') },
    { value: 'quarterly', label: t('temp.export.period.quarterly') },
    { value: 'yearly', label: t('temp.export.period.yearly') }
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
          <h3 className="text-lg font-semibold text-foreground">{t('temp.export.title')}</h3>
          <p className="caption text-muted-foreground">{t('temp.export.subtitle')}</p>
        </div>
      </div>
      <div className="space-y-4">
        <Select
          label={t('temp.export.select.format')}
          options={formatOptions}
          value={exportConfig?.format}
          onChange={(value) => setExportConfig({ ...exportConfig, format: value })}
        />

        <Select
          label={t('temp.export.select.period')}
          options={periodOptions}
          value={exportConfig?.period}
          onChange={(value) => setExportConfig({ ...exportConfig, period: value })}
        />

        <div className="space-y-3 pt-2">
          <p className="text-sm font-medium text-foreground">{t('temp.export.includeTitle')}</p>
          
          <Checkbox
            label={t('temp.export.include.charts')}
            description={t('temp.export.include.charts.desc')}
            checked={exportConfig?.includeCharts}
            onChange={(e) => setExportConfig({ ...exportConfig, includeCharts: e?.target?.checked })}
          />

          <Checkbox
            label={t('temp.export.include.stats')}
            description={t('temp.export.include.stats.desc')}
            checked={exportConfig?.includeStatistics}
            onChange={(e) => setExportConfig({ ...exportConfig, includeStatistics: e?.target?.checked })}
          />

          <Checkbox
            label={t('temp.export.include.alerts')}
            description={t('temp.export.include.alerts.desc')}
            checked={exportConfig?.includeAlerts}
            onChange={(e) => setExportConfig({ ...exportConfig, includeAlerts: e?.target?.checked })}
          />

          <Checkbox
            label={t('temp.export.include.comparison')}
            description={t('temp.export.include.comparison.desc')}
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
          {t('temp.export.button.generate')}
        </Button>
      </div>
    </div>
  );
};

export default ExportReportPanel;