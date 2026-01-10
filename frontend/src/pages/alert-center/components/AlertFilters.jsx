import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const AlertFilters = ({
  filters,
  onFilterChange,
  onReset,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  alertCount
}) => {
  const severityOptions = [
    { value: 'all', label: 'All Severities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'acknowledged', label: 'Acknowledged' },
    { value: 'resolved', label: 'Resolved' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'aqi', label: 'Air Quality' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'noise', label: 'Noise' },
    { value: 'water', label: 'Water Quality' }
  ];

  const locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'jaipur', label: 'Jaipur' },
    { value: 'jodhpur', label: 'Jodhpur' },
    { value: 'udaipur', label: 'Udaipur' },
    { value: 'bikaner', label: 'Bikaner' },
    { value: 'ajmer', label: 'Ajmer' }
  ];

  const dateRangeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'severity', label: 'Severity (High to Low)' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Sliders" size={20} />
          Filters & Search
        </h3>
        <span className="text-sm text-muted-foreground">
          {alertCount} alert{alertCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search alerts..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          icon="search"
        />
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <Select
          label="Severity"
          value={filters.severity}
          onChange={(value) => onFilterChange('severity', value)}
          options={severityOptions}
        />

        <Select
          label="Status"
          value={filters.status}
          onChange={(value) => onFilterChange('status', value)}
          options={statusOptions}
        />

        <Select
          label="Type"
          value={filters.type}
          onChange={(value) => onFilterChange('type', value)}
          options={typeOptions}
        />

        <Select
          label="Location"
          value={filters.location}
          onChange={(value) => onFilterChange('location', value)}
          options={locationOptions}
        />

        <Select
          label="Date Range"
          value={filters.dateRange}
          onChange={(value) => onFilterChange('dateRange', value)}
          options={dateRangeOptions}
        />
      </div>

      {/* Sort and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
        >
          <Icon name="RotateCcw" size={16} />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default AlertFilters;
