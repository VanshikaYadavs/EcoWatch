import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AlertDetailsModal = ({
  alert,
  onClose,
  onAcknowledge,
  onResolve,
  onDelete
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-red-50 text-red-700';
      case 'acknowledged':
        return 'bg-yellow-50 text-yellow-700';
      case 'resolved':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-card border border-border rounded-lg shadow-xl max-w-2xl w-full mx-4 transition-transform ${
          isClosing ? 'scale-95' : 'scale-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-border p-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(alert.severity)}`}>
                {alert.severity?.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(alert.status)}`}>
                {alert.status?.toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{alert.title}</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {new Date(alert.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Description</h3>
            <p className="text-muted-foreground">{alert.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 bg-muted/50 rounded-lg p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Type</p>
              <p className="font-semibold text-foreground capitalize">{alert.type}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Location</p>
              <p className="font-semibold text-foreground">{alert.location || 'Unknown'}</p>
            </div>
            {alert.parameter && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Parameter</p>
                <p className="font-semibold text-foreground">{alert.parameter}</p>
              </div>
            )}
            {alert.value && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Value</p>
                <p className="font-semibold text-foreground">{alert.value} {alert.unit}</p>
              </div>
            )}
            {alert.threshold && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Threshold</p>
                <p className="font-semibold text-foreground">{alert.threshold} {alert.unit}</p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          {alert.recommendations && (
            <div>
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Icon name="Lightbulb" size={18} />
                Recommendations
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                {Array.isArray(alert.recommendations)
                  ? alert.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))
                  : <li>{alert.recommendations}</li>}
              </ul>
            </div>
          )}

          {/* Timeline */}
          {alert.updates && alert.updates.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Timeline</h3>
              <div className="space-y-3">
                {alert.updates.map((update, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-border last:border-b-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{update.action}</p>
                      <p className="text-xs text-muted-foreground">{new Date(update.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          {alert.status !== 'resolved' && (
            <>
              {alert.status === 'active' && (
                <Button
                  onClick={() => {
                    onAcknowledge(alert.id);
                    handleClose();
                  }}
                  variant="outline"
                >
                  <Icon name="Check" size={16} />
                  Acknowledge
                </Button>
              )}
              <Button
                onClick={() => {
                  onResolve(alert.id);
                  handleClose();
                }}
              >
                <Icon name="CheckSquare" size={16} />
                Resolve
              </Button>
            </>
          )}
          <Button
            onClick={() => {
              onDelete(alert.id);
              handleClose();
            }}
            variant="destructive"
          >
            <Icon name="Trash2" size={16} />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailsModal;


