import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const AlertBanner = ({ alerts = [], onDismiss }) => {
  const [currentAlert, setCurrentAlert] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (alerts?.length > 0) {
      setCurrentAlert(alerts?.[0]);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [alerts]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) {
        onDismiss(currentAlert?.id);
      }
    }, 250);
  };

  if (!currentAlert || !isVisible) return null;

  const severityConfig = {
    critical: {
      className: 'critical',
      icon: 'AlertTriangle',
      label: 'Critical Alert'
    },
    warning: {
      className: 'warning',
      icon: 'AlertCircle',
      label: 'Warning'
    },
    info: {
      className: 'info',
      icon: 'Info',
      label: 'Information'
    }
  };

  const config = severityConfig?.[currentAlert?.severity] || severityConfig?.info;

  return (
    <div
      className={`alert-banner ${config?.className} ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-center gap-4 flex-1">
        <Icon 
          name={config?.icon} 
          size={24} 
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">
            {config?.label}: {currentAlert?.title}
          </p>
          {currentAlert?.message && (
            <p className="text-sm opacity-90 mt-1">
              {currentAlert?.message}
            </p>
          )}
          {currentAlert?.location && (
            <p className="caption mt-1 opacity-75">
              Location: {currentAlert?.location}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {currentAlert?.actionLabel && (
          <button
            onClick={currentAlert?.onAction}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/20 hover:bg-white/30 transition-smooth focus-ring"
          >
            {currentAlert?.actionLabel}
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="touch-target p-2 rounded-lg hover:bg-white/10 transition-smooth focus-ring"
          aria-label="Dismiss alert"
        >
          <Icon name="X" size={20} />
        </button>
      </div>
    </div>
  );
};

export default AlertBanner;