import React from 'react';
import Icon from '../../../components/AppIcon';

const AlertsList = ({
  alerts = [],
  loading,
  onSelectAlert,
  onAcknowledge,
  onResolve,
  onDelete
}) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'acknowledged':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'resolved':
        return 'bg-green-50 text-green-700 border border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'aqi':
        return 'Wind';
      case 'temperature':
        return 'Thermometer';
      case 'noise':
        return 'Volume2';
      case 'water':
        return 'Droplets';
      default:
        return 'Info';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 mt-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
            <div className="h-20 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="mt-6 text-center py-12 bg-card border border-border rounded-lg">
        <Icon name="Inbox" size={48} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No alerts found</h3>
        <p className="text-muted-foreground">Try adjusting your filters to see more alerts</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectAlert(alert)}
        >
          <div className="flex items-start gap-4">
            {/* Severity Icon */}
            <div className={`flex-shrink-0 p-3 rounded-lg ${getSeverityColor(alert.severity)}`}>
              <Icon name={getSeverityIcon(alert.severity)} size={20} />
            </div>

            {/* Alert Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground truncate">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                </div>
                <span className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusBadge(alert.status)}`}>
                  {alert.status?.charAt(0).toUpperCase() + alert.status?.slice(1)}
                </span>
              </div>

              {/* Alert Metadata */}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Icon name={getTypeIcon(alert.type)} size={14} />
                  {alert.type?.toUpperCase()}
                </span>
                <span>{alert.location || 'Unknown Location'}</span>
                <span>{new Date(alert.created_at).toLocaleString()}</span>
                {alert.value && (
                  <span className="font-medium text-foreground">
                    {alert.parameter}: {alert.value} {alert.unit}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex-shrink-0 flex gap-2">
              {alert.status !== 'resolved' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcknowledge(alert.id);
                  }}
                  className="p-2 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                  title="Acknowledge"
                >
                  <Icon name="Check" size={18} />
                </button>
              )}
              {alert.status === 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResolve(alert.id);
                  }}
                  className="p-2 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                  title="Resolve"
                >
                  <Icon name="CheckSquare" size={18} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(alert.id);
                }}
                className="p-2 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-destructive"
                title="Delete"
              >
                <Icon name="Trash2" size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertsList;


