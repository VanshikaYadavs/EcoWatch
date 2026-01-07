import React from 'react';
import Icon from '../../../components/AppIcon';


const TimeRangeSelector = ({ selectedRange, onRangeChange, customStartDate, customEndDate, onCustomDateChange }) => {
  const timeRanges = [
    { id: '24h', label: '24 Hours', icon: 'Clock' },
    { id: '7d', label: '7 Days', icon: 'Calendar' },
    { id: '30d', label: '30 Days', icon: 'CalendarDays' },
    { id: '90d', label: '90 Days', icon: 'CalendarRange' },
    { id: 'custom', label: 'Custom Range', icon: 'CalendarClock' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="CalendarRange" size={20} color="var(--color-primary)" />
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          Time Range
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
        {timeRanges?.map((range) => {
          const isSelected = selectedRange === range?.id;
          
          return (
            <button
              key={range?.id}
              onClick={() => onRangeChange(range?.id)}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-250 ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <Icon name={range?.icon} size={16} />
              <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                {range?.label}
              </span>
            </button>
          );
        })}
      </div>
      {selectedRange === 'custom' && (
        <div className="mt-4 p-4 rounded-lg bg-muted border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => onCustomDateChange('start', e?.target?.value)}
                max={customEndDate || new Date()?.toISOString()?.split('T')?.[0]}
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => onCustomDateChange('end', e?.target?.value)}
                min={customStartDate}
                max={new Date()?.toISOString()?.split('T')?.[0]}
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;