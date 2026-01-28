import React from 'react';
import Icon from '../../../components/AppIcon';

const AlertTimeline = ({ alerts = [], loading, onSelectAlert }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-4">
              <div className="w-1 bg-muted rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-lg">
        <Icon name="Clock" size={48} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No alerts in timeline</h3>
        <p className="text-muted-foreground">Try adjusting your filters</p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return 'AlertTriangle';
      case 'high':
        return 'Alert';
      case 'medium':
        return 'Info';
      case 'low':
        return 'CheckCircle';
      default:
        return 'Info';
    }
  };

  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 to-transparent"></div>

      {/* Timeline Items */}
      <div className="space-y-6">
        {alerts.map((alert, index) => (
          <div
            key={alert.id}
            onClick={() => onSelectAlert(alert)}
            className="relative pl-16 cursor-pointer group"
          >
            {/* Timeline Dot */}
            <div className={`absolute left-0 w-12 h-12 ${getSeverityColor(alert.severity)} rounded-full flex items-center justify-center shadow-lg -ml-6 group-hover:scale-110 transition-transform`}>
              <Icon name={getSeverityIcon(alert.severity)} size={24} className="text-white" />
            </div>

            {/* Content Card */}
            <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{alert.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  alert.status === 'active' ? 'bg-red-50 text-red-700' :
                  alert.status === 'acknowledged' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-green-50 text-green-700'
                }`}>
                  {alert.status?.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon name="MapPin" size={14} />
                  {alert.location}
                </span>
                {alert.type && (
                  <span className="flex items-center gap-1">
                    <Icon name="Tag" size={14} />
                    {alert.type}
                  </span>
                )}
                {alert.value && (
                  <span className="font-medium text-foreground">
                    {alert.parameter}: {alert.value} {alert.unit}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertTimeline;


