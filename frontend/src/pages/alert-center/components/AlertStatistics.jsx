import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const AlertStatistics = ({ alerts = [], loading }) => {
  const stats = useMemo(() => {
    if (!alerts.length) {
      return {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        active: 0,
        resolved: 0
      };
    }

    return {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
      active: alerts.filter(a => a.status === 'active').length,
      resolved: alerts.filter(a => a.status === 'resolved').length
    };
  }, [alerts]);

  const StatCard = ({ icon, label, value, color, trend }) => (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('700', '100')}`}>
          <Icon name={icon} size={24} className={color} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
            <div className="h-16 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      <StatCard
        icon="AlertCircle"
        label="Total Alerts"
        value={stats.total}
        color="text-blue-700"
      />
      <StatCard
        icon="AlertTriangle"
        label="Critical"
        value={stats.critical}
        color="text-red-700"
      />
      <StatCard
        icon="Alert"
        label="High"
        value={stats.high}
        color="text-orange-700"
      />
      <StatCard
        icon="Info"
        label="Medium"
        value={stats.medium}
        color="text-yellow-700"
      />
      <StatCard
        icon="CheckCircle"
        label="Low"
        value={stats.low}
        color="text-green-700"
      />
      <StatCard
        icon="Zap"
        label="Active"
        value={stats.active}
        color="text-red-700"
      />
      <StatCard
        icon="Check"
        label="Resolved"
        value={stats.resolved}
        color="text-green-700"
      />
    </div>
  );
};

export default AlertStatistics;
