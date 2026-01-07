import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FilterControls = ({ 
  filters, 
  onFilterChange, 
  onExport,
  locations,
  pollutantTypes 
}) => {
  const timeRangeOptions = [
    { value: 'hourly', label: 'Last Hour' },
    { value: '6hours', label: 'Last 6 Hours' },
    { value: '24hours', label: 'Last 24 Hours' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'year', label: 'Last Year' }
  ];

  const aqiCategoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'good', label: 'Good (0-50)' },
    { value: 'moderate', label: 'Moderate (51-100)' },
    { value: 'unhealthy-sensitive', label: 'Unhealthy for Sensitive (101-150)' },
    { value: 'unhealthy', label: 'Unhealthy (151-200)' },
    { value: 'very-unhealthy', label: 'Very Unhealthy (201-300)' },
    { value: 'hazardous', label: 'Hazardous (301+)' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">Filter & Export</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Customize data view and export reports
          </p>
        </div>
        <Button
          variant="default"
          iconName="Download"
          iconPosition="left"
          onClick={onExport}
        >
          Export Report
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Time Range"
          options={timeRangeOptions}
          value={filters?.timeRange}
          onChange={(value) => onFilterChange('timeRange', value)}
        />

        <Select
          label="Location"
          options={locations}
          value={filters?.location}
          onChange={(value) => onFilterChange('location', value)}
          searchable
        />

        <Select
          label="Pollutant Type"
          options={pollutantTypes}
          value={filters?.pollutants}
          onChange={(value) => onFilterChange('pollutants', value)}
          multiple
          searchable
        />

        <Select
          label="AQI Category"
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
          Reset Filters
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <Icon name="Filter" size={16} color="var(--color-muted-foreground)" />
          <span className="text-sm text-muted-foreground">
            {Object.values(filters)?.filter(v => v && v !== 'all')?.length} active filters
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;