import React from 'react';
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
  const timeRangeOptions = [
    { value: 'realtime', label: 'Real-time' },
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' }
  ];

  const locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'downtown', label: 'MI Road, Jaipur' },
    { value: 'industrial', label: 'Industrial Area, Tonk' },
    { value: 'residential', label: 'Lake Pichola, Udaipur' },
    { value: 'commercial', label: 'Pushkar Road, Ajmer' }
  ];

  const parameterOptions = [
    { value: 'all', label: 'All Parameters' },
    { value: 'aqi', label: 'Air Quality Index' },
    { value: 'noise', label: 'Noise Levels' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'humidity', label: 'Humidity' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 mb-4 md:mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Icon name="Filter" size={20} color="var(--color-primary)" />
          <h3 className="text-sm md:text-base font-medium">Filters</h3>
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
            Refresh
          </Button>

          <Button
            variant="secondary"
            iconName="Download"
            iconPosition="left"
            onClick={onExport}
            className="flex-1 lg:flex-none"
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;