import React from 'react';
import Icon from '../../../components/AppIcon';

const HotspotMarker = ({ 
  location, 
  severity, 
  type, 
  value, 
  onClick,
  isActive 
}) => {
  const severityConfig = {
    high: {
      color: 'var(--color-error)',
      bgColor: 'bg-error',
      textColor: 'text-error',
      icon: 'AlertTriangle'
    },
    medium: {
      color: 'var(--color-warning)',
      bgColor: 'bg-warning',
      textColor: 'text-warning',
      icon: 'AlertCircle'
    },
    low: {
      color: 'var(--color-success)',
      bgColor: 'bg-success',
      textColor: 'text-success',
      icon: 'Info'
    }
  };

  const config = severityConfig?.[severity] || severityConfig?.medium;

  return (
    <div 
      onClick={onClick}
      className="relative cursor-pointer group"
    >
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${config?.bgColor} flex items-center justify-center animate-pulse hover:scale-110 transition-transform duration-250`}>
        <Icon name={config?.icon} size={16} color="white" className="md:w-5 md:h-5" />
      </div>
      {isActive && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 md:w-56 p-3 md:p-4 bg-popover border border-border rounded-lg shadow-xl z-10">
          <div className="flex items-start gap-2 mb-2">
            <Icon name={config?.icon} size={18} color={config?.color} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground mb-1">{location}</h4>
              <p className="text-xs text-muted-foreground capitalize">{type} Alert</p>
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <p className={`text-lg md:text-xl font-bold font-data ${config?.textColor}`}>{value}</p>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-popover border-r border-b border-border rotate-45" />
        </div>
      )}
    </div>
  );
};

export default HotspotMarker;