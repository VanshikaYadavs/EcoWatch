import React from 'react';
import Icon from '../../../components/AppIcon';

const AccountStatistics = () => {
  const statistics = [
    {
      label: 'Dashboard Views',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: 'Eye',
      color: 'var(--color-primary)'
    },
    {
      label: 'Alerts Acknowledged',
      value: '89',
      change: '+5%',
      trend: 'up',
      icon: 'Bell',
      color: 'var(--color-success)'
    },
    {
      label: 'Reports Generated',
      value: '34',
      change: '-3%',
      trend: 'down',
      icon: 'FileText',
      color: 'var(--color-warning)'
    },
    {
      label: 'Data Exports',
      value: '156',
      change: '+8%',
      trend: 'up',
      icon: 'Download',
      color: 'var(--color-secondary)'
    },
    {
      label: 'Login Sessions',
      value: '423',
      change: '+15%',
      trend: 'up',
      icon: 'LogIn',
      color: 'var(--color-primary)'
    },
    {
      label: 'Configuration Changes',
      value: '27',
      change: '+2%',
      trend: 'up',
      icon: 'Settings',
      color: 'var(--color-error)'
    }
  ];

  const usageByFeature = [
    { feature: 'Environmental Dashboard', usage: 85, color: 'var(--color-primary)' },
    { feature: 'Air Quality Monitor', usage: 72, color: 'var(--color-success)' },
    { feature: 'Temperature Analytics', usage: 58, color: 'var(--color-warning)' },
    { feature: 'Noise Level Tracking', usage: 45, color: 'var(--color-error)' },
    { feature: 'Historical Reports', usage: 38, color: 'var(--color-secondary)' }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Statistics Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="BarChart3" size={20} color="var(--color-primary)" />
          Account Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statistics?.map((stat, index) => (
            <div
              key={index}
              className="bg-muted rounded-lg p-4 hover:bg-muted-foreground/5 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-card rounded-lg">
                  <Icon name={stat?.icon} size={20} color={stat?.color} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat?.trend === 'up' ?'bg-success/10 text-success' :'bg-error/10 text-error'
                }`}>
                  {stat?.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat?.value}</div>
              <div className="text-sm text-muted-foreground">{stat?.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage by Feature */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="TrendingUp" size={20} color="var(--color-primary)" />
          Feature Usage
        </h3>
        <div className="bg-muted rounded-lg p-4 space-y-4">
          {usageByFeature?.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{item?.feature}</span>
                <span className="text-muted-foreground">{item?.usage}%</span>
              </div>
              <div className="w-full bg-card rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item?.usage}%`,
                    backgroundColor: item?.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Summary */}
      <div className="bg-muted rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Info" size={20} color="var(--color-primary)" />
          Account Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Account Created</span>
            <span className="font-medium text-foreground">January 15, 2025</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last Login</span>
            <span className="font-medium text-foreground">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Sessions</span>
            <span className="font-medium text-foreground">423</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Average Session Duration</span>
            <span className="font-medium text-foreground">24 minutes</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <Icon name="Info" size={20} color="var(--color-primary)" className="mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground mb-1">Usage Analytics</h4>
          <p className="text-sm text-muted-foreground">
            Statistics are updated in real-time and reflect your activity over the last 30 days. Percentage changes compare to the previous 30-day period.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountStatistics;