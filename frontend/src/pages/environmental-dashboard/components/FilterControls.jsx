import React from 'react';
import { useTranslation } from 'react-i18next';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FilterControls = ({ 
  timeRange, 
  location, 
  parameter,
  onTimeRangeChange,
  onLocationChange,
  onParameterChange,
  onRefresh,
  onExport
}) => {
  const { t } = useTranslation();

  const timeRangeOptions = [
    { value: 'realtime', label: t('env.filters.timeRange.realtime') },
    { value: '1h', label: t('env.filters.timeRange.1h') },
    { value: '6h', label: t('env.filters.timeRange.6h') },
    { value: '24h', label: t('env.filters.timeRange.24h') },
    { value: '7d', label: t('env.filters.timeRange.7d') }
  ];

  const locationOptions = [
    { value: 'all', label: t('env.filters.location.all') },
    { value: 'downtown', label: t('env.filters.location.downtown') },
    { value: 'industrial', label: t('env.filters.location.industrial') },
    { value: 'residential', label: t('env.filters.location.residential') },
    { value: 'commercial', label: t('env.filters.location.commercial') }
  ];

  const parameterOptions = [
    { value: 'all', label: t('env.filters.parameter.all') },
    { value: 'aqi', label: t('env.filters.parameter.aqi') },
    { value: 'noise', label: t('env.filters.parameter.noise') },
    { value: 'temperature', label: t('env.filters.parameter.temperature') },
    { value: 'humidity', label: t('env.filters.parameter.humidity') }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 mb-4 md:mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Icon name="Filter" size={20} color="var(--color-primary)" />
          <h3 className="text-sm md:text-base font-medium">{t('env.filters.title')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 flex-1 w-full lg:w-auto">
          <Select
            options={timeRangeOptions}
            value={timeRange}
            onChange={onTimeRangeChange}
            placeholder="Select time range"
          />

          <Select
            options={locationOptions}
            value={location}
            onChange={onLocationChange}
            placeholder="Select location"
          />

          <Select
            options={parameterOptions}
            value={parameter}
            onChange={onParameterChange}
            placeholder="Select parameter"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Button
            variant="outline"
            iconName="RefreshCw"
            iconPosition="left"
            onClick={onRefresh}
            className="flex-1 lg:flex-none"
          >
            {t('buttons.refresh')}
          </Button>

          <Button
            variant="secondary"
            iconName="Download"
            iconPosition="left"
            onClick={onExport}
            className="flex-1 lg:flex-none"
          >
            {t('buttons.export')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;

