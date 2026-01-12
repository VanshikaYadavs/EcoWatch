import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const NotificationHistory = () => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock notification history data
  const notifications = [
    {
      id: 1,
      type: 'airQuality',
      title: 'High AQI Alert',
      message: `AQI exceeded threshold of 100 at ${t('locations.miRoad')}`,
      timestamp: '2026-01-06 18:30:00',
      status: 'delivered',
      channels: ['email', 'push'],
      severity: 'high',
      acknowledged: true
    },
    {
      id: 2,
      type: 'noise',
      title: 'Noise Regulation Violation',
      message: `Noise level of 95 dB detected at ${t('locations.clockTower')}`,
      timestamp: '2026-01-06 17:45:00',
      status: 'delivered',
      channels: ['email', 'sms', 'push'],
      severity: 'critical',
      acknowledged: true
    },
    {
      id: 3,
      type: 'temperature',
      title: 'Heat Warning',
      message: `Temperature reached 35°C at ${t('locations.pushkarRoad')}`,
      timestamp: '2026-01-06 16:20:00',
      status: 'delivered',
      channels: ['email', 'dashboard'],
      severity: 'medium',
      acknowledged: false
    },
    {
      id: 4,
      type: 'emergency',
      title: 'System Failure Alert',
      message: `Sensor offline at ${t('locations.bikanerIndustrial')}`,
      timestamp: '2026-01-06 15:10:00',
      status: 'failed',
      channels: ['email'],
      severity: 'critical',
      acknowledged: false
    },
    {
      id: 5,
      type: 'airQuality',
      title: 'PM2.5 Threshold Exceeded',
      message: `PM2.5 level of 45 µg/m³ at ${t('locations.lakePichola')}`,
      timestamp: '2026-01-06 14:00:00',
      status: 'delivered',
      channels: ['email', 'push', 'dashboard'],
      severity: 'medium',
      acknowledged: true
    }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'airQuality', label: 'Air Quality' },
    { value: 'noise', label: 'Noise' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' }
  ];

  const getTypeIcon = (type) => {
    const icons = {
      airQuality: 'Wind',
      noise: 'Volume2',
      temperature: 'Thermometer',
      emergency: 'AlertTriangle'
    };
    return icons?.[type] || 'Bell';
  };

  const getTypeColor = (type) => {
    const colors = {
      airQuality: 'var(--color-primary)',
      noise: 'var(--color-warning)',
      temperature: 'var(--color-error)',
      emergency: 'var(--color-error)'
    };
    return colors?.[type] || 'var(--color-muted-foreground)';
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      critical: 'bg-error/10 text-error border-error/20',
      high: 'bg-warning/10 text-warning border-warning/20',
      medium: 'bg-primary/10 text-primary border-primary/20',
      low: 'bg-success/10 text-success border-success/20'
    };
    return styles?.[severity] || styles?.medium;
  };

  const getStatusBadge = (status) => {
    const styles = {
      delivered: 'bg-success/10 text-success',
      failed: 'bg-error/10 text-error',
      pending: 'bg-warning/10 text-warning'
    };
    return styles?.[status] || styles?.pending;
  };

  const filteredNotifications = notifications?.filter((notif) => {
    if (filterType !== 'all' && notif?.type !== filterType) return false;
    if (filterStatus !== 'all' && notif?.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Select
            label="Filter by Type"
            options={typeOptions}
            value={filterType}
            onChange={setFilterType}
          />
        </div>
        <div className="flex-1">
          <Select
            label="Filter by Status"
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={() => console.log('Export history')}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sent</p>
              <p className="text-2xl font-bold text-foreground">{notifications?.length}</p>
            </div>
            <Icon name="Send" size={24} color="var(--color-primary)" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold text-success">
                {notifications?.filter(n => n?.status === 'delivered')?.length}
              </p>
            </div>
            <Icon name="CheckCircle" size={24} color="var(--color-success)" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-error">
                {notifications?.filter(n => n?.status === 'failed')?.length}
              </p>
            </div>
            <Icon name="XCircle" size={24} color="var(--color-error)" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Acknowledged</p>
              <p className="text-2xl font-bold text-foreground">
                {notifications?.filter(n => n?.acknowledged)?.length}
              </p>
            </div>
            <Icon name="Eye" size={24} color="var(--color-primary)" />
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Recent Notifications</h3>
        {filteredNotifications?.map((notification) => (
          <div
            key={notification?.id}
            className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-smooth"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Icon
                  name={getTypeIcon(notification?.type)}
                  size={20}
                  color={getTypeColor(notification?.type)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-foreground mb-1">
                      {notification?.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{notification?.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityBadge(notification?.severity)}`}>
                      {notification?.severity}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(notification?.status)}`}>
                      {notification?.status}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="Clock" size={12} />
                    {notification?.timestamp}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Send" size={12} />
                    {notification?.channels?.join(', ')}
                  </span>
                  {notification?.acknowledged && (
                    <span className="flex items-center gap-1 text-success">
                      <Icon name="CheckCircle" size={12} />
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Inbox" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <p className="text-muted-foreground">No notifications found matching your filters</p>
        </div>
      )}
    </div>
  );
};

export default NotificationHistory;