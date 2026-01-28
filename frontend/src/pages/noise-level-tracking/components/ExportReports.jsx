import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { useTranslation } from 'react-i18next';

const ExportReports = ({ exportSettings, onSettingsChange, onExport }) => {
  const { t } = useTranslation();

  const reportTypeOptions = [
    { value: 'compliance', label: t('noise.export.reportType.compliance'), description: t('noise.export.reportType.compliance.desc') },
    { value: 'community', label: t('noise.export.reportType.community'), description: t('noise.export.reportType.community.desc') },
    { value: 'detailed', label: t('noise.export.reportType.detailed'), description: t('noise.export.reportType.detailed.desc') },
    { value: 'summary', label: t('noise.export.reportType.summary'), description: t('noise.export.reportType.summary.desc') }
  ];

  const formatOptions = [
    { value: 'pdf', label: t('noise.export.format.pdf') },
    { value: 'excel', label: t('noise.export.format.excel') },
    { value: 'csv', label: t('noise.export.format.csv') },
    { value: 'json', label: t('noise.export.format.json') }
  ];

  const timeRangeOptions = [
    { value: 'last24h', label: t('noise.time.last24h') },
    { value: 'last7d', label: t('noise.time.last7d') },
    { value: 'last30d', label: t('noise.time.last30d') },
    { value: 'custom', label: t('noise.time.custom') }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8 shadow-md">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Icon name="Download" size={24} color="var(--color-accent)" />
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
          {t('noise.export.title')}
        </h2>
      </div>
      <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
        {t('noise.export.subtitle')}
      </p>
      <div className="space-y-4 md:space-y-6">
        <Select
          label={t('noise.export.select.reportType')}
          description={t('noise.export.select.reportType.desc')}
          options={reportTypeOptions}
          value={exportSettings?.reportType}
          onChange={(value) => onSettingsChange('reportType', value)}
        />

        <Select
          label={t('noise.export.select.format')}
          description={t('noise.export.select.format.desc')}
          options={formatOptions}
          value={exportSettings?.format}
          onChange={(value) => onSettingsChange('format', value)}
        />

        <Select
          label={t('noise.export.select.timeRange')}
          description={t('noise.export.select.timeRange.desc')}
          options={timeRangeOptions}
          value={exportSettings?.timeRange}
          onChange={(value) => onSettingsChange('timeRange', value)}
        />

        <div className="bg-muted rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-medium text-foreground mb-3 md:mb-4">
            {t('noise.export.preview.title')}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('noise.export.preview.type')}:</span>
              <span className="font-medium text-foreground">
                {reportTypeOptions?.find(opt => opt?.value === exportSettings?.reportType)?.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('noise.export.preview.format')}:</span>
              <span className="font-medium text-foreground">
                {formatOptions?.find(opt => opt?.value === exportSettings?.format)?.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('noise.export.preview.timeRange')}:</span>
              <span className="font-medium text-foreground">
                {timeRangeOptions?.find(opt => opt?.value === exportSettings?.timeRange)?.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('noise.export.preview.generated')}:</span>
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
                {t('noise.export.contents.title')}
              </h3>
              <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
                <li>• {t('noise.export.contents.realtime')}</li>
                <li>• {t('noise.export.contents.compliance')}</li>
                <li>• {t('noise.export.contents.location')}</li>
                <li>• {t('noise.export.contents.frequency')}</li>
                <li>• {t('noise.export.contents.alerts')}</li>
                <li>• {t('noise.export.contents.stats')}</li>
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
            {t('noise.export.button.generate')}
          </Button>
          <Button
            variant="outline"
            iconName="Eye"
            iconPosition="left"
            onClick={() => {}}
            fullWidth
          >
            {t('noise.export.button.preview')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportReports;