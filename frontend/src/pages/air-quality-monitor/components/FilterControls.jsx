import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const FilterControls = ({ 
  filters, 
  onFilterChange, 
  onExport,
  locations,
  pollutantTypes 
}) => {
  const { t } = useTranslation();

  const timeRangeOptions = [
    { value: 'hourly', label: t('aq.time.hour') },
    { value: '6hours', label: t('aq.time.6hours') },
    { value: '24hours', label: t('aq.time.24hours') },
    { value: 'week', label: t('aq.time.week') },
    { value: 'month', label: t('aq.time.month') },
    { value: 'year', label: t('aq.time.year') }
  ];

  const aqiCategoryOptions = [
    { value: 'all', label: t('filters.all') || 'All Categories' },
    { value: 'good', label: `${t('aq.legend.good')} (0-50)` },
    { value: 'moderate', label: `${t('aq.legend.moderate')} (51-100)` },
    { value: 'unhealthy-sensitive', label: `${t('aq.legend.unhealthySensitive')} (101-150)` },
    { value: 'unhealthy', label: `${t('aq.legend.unhealthy')} (151-200)` },
    { value: 'very-unhealthy', label: `${t('aq.legend.veryUnhealthy')} (201-300)` },
    { value: 'hazardous', label: `${t('aq.legend.hazardous')} (301+)` }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">{t('aq.filters.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('aq.filters.subtitle')}</p>
        </div>
        <Button
          variant="default"
          iconName="Download"
          iconPosition="left"
          onClick={onExport}
        >
          {t('aq.filters.export')}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label={t('aq.filters.label.timeRange')}
          options={timeRangeOptions}
          value={filters?.timeRange}
          onChange={(value) => onFilterChange('timeRange', value)}
        />

        <Select
          label={t('aq.filters.label.location')}
          options={locations}
          value={filters?.location}
          onChange={(value) => onFilterChange('location', value)}
          searchable
        />

        <Select
          label={t('aq.filters.label.pollutantType')}
          options={pollutantTypes}
          value={filters?.pollutants}
          onChange={(value) => onFilterChange('pollutants', value)}
          multiple
          searchable
        />

        <Select
          label={t('aq.filters.label.aqiCategory')}
          options={aqiCategoryOptions}
          value={filters?.aqiCategory}
          onChange={(value) => onFilterChange('aqiCategory', value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          iconName="RotateCcw"
          iconPosition="left"
          onClick={() => onFilterChange('reset', null)}
        >
          {t('aq.filters.reset')}
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <Icon name="Filter" size={16} color="var(--color-muted-foreground)" />
          <span className="text-sm text-muted-foreground">
            {t('aq.filters.active', { count: Object.values(filters)?.filter(v => v && v !== 'all')?.length })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;