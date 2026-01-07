import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActivityHistory = () => {
  const [filter, setFilter] = useState('all');

  const activities = [
    {
      id: 1,
      type: 'login',
      icon: 'LogIn',
      color: 'var(--color-success)',
      title: 'Successful Login',
      description: 'Chrome on Windows • Jaipur, Rajasthan',
      timestamp: '2026-01-06 19:45:23'
    },
    {
      id: 2,
      type: 'config',
      icon: 'Settings',
      color: 'var(--color-primary)',
      title: 'Updated Notification Settings',
      description: 'Changed email notification preferences',
      timestamp: '2026-01-06 18:30:15'
    },
    {
      id: 3,
      type: 'report',
      icon: 'FileText',
      color: 'var(--color-warning)',
      title: 'Generated Report',
      description: 'Air Quality Monthly Report - December 2025',
      timestamp: '2026-01-06 16:20:45'
    },
    {
      id: 4,
      type: 'login',
      icon: 'LogIn',
      color: 'var(--color-success)',
      title: 'Successful Login',
      description: 'Safari on iPhone • Jaipur, Rajasthan',
      timestamp: '2026-01-06 14:10:30'
    },
    {
      id: 5,
      type: 'config',
      icon: 'Settings',
      color: 'var(--color-primary)',
      title: 'Updated Profile Information',
      description: 'Changed phone number and department',
      timestamp: '2026-01-05 11:25:10'
    },
    {
      id: 6,
      type: 'alert',
      icon: 'Bell',
      color: 'var(--color-error)',
      title: 'Acknowledged Critical Alert',
      description: 'AQI exceeded threshold at MI Road, Jaipur',
      timestamp: '2026-01-05 09:15:22'
    },
    {
      id: 7,
      type: 'export',
      icon: 'Download',
      color: 'var(--color-secondary)',
      title: 'Exported Data',
      description: 'Temperature analytics data (CSV format)',
      timestamp: '2026-01-04 15:40:18'
    },
    {
      id: 8,
      type: 'login',
      icon: 'LogIn',
      color: 'var(--color-success)',
      title: 'Successful Login',
      description: 'Chrome on Windows • Jaipur, Rajasthan',
      timestamp: '2026-01-04 08:30:05'
    }
  ];

  const filteredActivities = filter === 'all'
    ? activities
    : activities?.filter(activity => activity?.type === filter);

  const filterOptions = [
    { value: 'all', label: 'All Activity', icon: 'Activity' },
    { value: 'login', label: 'Logins', icon: 'LogIn' },
    { value: 'config', label: 'Configuration', icon: 'Settings' },
    { value: 'report', label: 'Reports', icon: 'FileText' },
    { value: 'alert', label: 'Alerts', icon: 'Bell' },
    { value: 'export', label: 'Exports', icon: 'Download' }
  ];

  const handleExportHistory = () => {
    console.log('Exporting activity history');
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="History" size={20} color="var(--color-primary)" />
          Activity History
        </h3>
        <Button
          variant="outline"
          iconName="Download"
          iconPosition="left"
          onClick={handleExportHistory}
        >
          Export History
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filterOptions?.map((option) => (
          <button
            key={option?.value}
            onClick={() => setFilter(option?.value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
              transition-all duration-200
              ${filter === option?.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground'
              }
            `}
          >
            <Icon name={option?.icon} size={16} />
            {option?.label}
          </button>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3">
        {filteredActivities?.map((activity, index) => (
          <div
            key={activity?.id}
            className="bg-muted rounded-lg p-4 flex items-start gap-4 hover:bg-muted-foreground/5 transition-colors"
          >
            <div className="p-2 bg-card rounded-lg">
              <Icon name={activity?.icon} size={20} color={activity?.color} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">{activity?.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{activity?.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="Clock" size={12} />
                {activity?.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredActivities?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Inbox" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-foreground mb-2">No Activity Found</h4>
          <p className="text-sm text-muted-foreground">
            No activities match the selected filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;