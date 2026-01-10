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
  alertCount,
  viewMode,
  onViewModeChange
}) => {
  const severityOptions = [
    { value: 'all', label: 'All Severities' },
    { value: 'critical', label: '🔴 Critical' },
    { value: 'high', label: '🟠 High' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'low', label: '🔵 Low' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: '⚡ Active' },
    { value: 'acknowledged', label: '⏱️ Acknowledged' },
    { value: 'resolved', label: '✅ Resolved' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'aqi', label: '💨 Air Quality' },
    { value: 'temperature', label: '🌡️ Temperature' },
    { value: 'noise', label: '🔊 Noise' },
    { value: 'water', label: '💧 Water Quality' }
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

  const isFiltered = filters.severity !== 'all' || filters.status !== 'all' || filters.type !== 'all' || filters.location !== 'all' || filters.dateRange !== '7days' || searchTerm;

  return (
    <div className="bg-card border border-border rounded-lg p-4 sticky top-4 h-fit">
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
          <Icon name="Sliders" size={20} />
          Filters
        </h3>
        <p className="text-sm text-muted-foreground">{alertCount} result{alertCount !== 1 ? 's' : ''}</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <label className="text-sm font-medium text-foreground block mb-2">Search</label>
        <Input
          type="text"
          placeholder="Alert title..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          icon="Search"
        />
      </div>

      {/* Filter Sections */}
      <div className="space-y-4">
        {/* Severity */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Severity</label>
          <Select
            value={filters.severity}
            onChange={(value) => onFilterChange('severity', value)}
            options={severityOptions}
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Status</label>
          <Select
            value={filters.status}
            onChange={(value) => onFilterChange('status', value)}
            options={statusOptions}
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Type</label>
          <Select
            value={filters.type}
            onChange={(value) => onFilterChange('type', value)}
            options={typeOptions}
          />
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Location</label>
          <Select
            value={filters.location}
            onChange={(value) => onFilterChange('location', value)}
            options={locationOptions}
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Date Range</label>
          <Select
            value={filters.dateRange}
            onChange={(value) => onFilterChange('dateRange', value)}
            options={dateRangeOptions}
          />
        </div>

        {/* Sort */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-border space-y-2">
        {isFiltered && (
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Icon name="RotateCcw" size={16} />
            Reset Filters
          </Button>
        )}
        <div className="text-xs text-muted-foreground text-center py-2">
          Real-time monitoring
        </div>
      </div>
    </div>
  );
};

export default AlertFilters;
