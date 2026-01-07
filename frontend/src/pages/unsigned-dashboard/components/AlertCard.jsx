import React from 'react';
import Icon from '../../../components/AppIcon';

const AlertCard = ({ 
  title, 
  location, 
  severity, 
  timestamp, 
  parameter, 
  value,
  threshold,
  onClick 
}) => {
  const severityConfig = {
    critical: {
      bgColor: 'bg-error/10',
      textColor: 'text-error',
      borderColor: 'border-error/20',
      icon: 'AlertTriangle',
      label: 'Critical'
    },
    high: {
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      borderColor: 'border-warning/20',
      icon: 'AlertCircle',
      label: 'High'
    },
    medium: {
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      borderColor: 'border-warning/20',
      icon: 'Info',
      label: 'Medium'
    }
  };

  const config = severityConfig?.[severity] || severityConfig?.medium;

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date?.toLocaleDateString('en-IN');
  };

  return (
    <div 
      onClick={onClick}
      className={`p-4 md:p-5 rounded-xl border ${config?.borderColor} ${config?.bgColor} hover:shadow-lg transition-all duration-250 ease-out ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${config?.bgColor}`}>
          <Icon name={config?.icon} size={20} color={config?.textColor?.replace('text-', 'var(--color-')} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm md:text-base font-semibold text-foreground line-clamp-1">{title}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-caption ${config?.textColor} ${config?.bgColor}`}>
              {config?.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Icon name="MapPin" size={14} />
            <span>{location}</span>
            <span>•</span>
            <span>{formatTimestamp(timestamp)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div>
          <p className="text-xs font-caption text-muted-foreground mb-1">{parameter}</p>
          <p className={`text-lg md:text-xl font-bold font-data ${config?.textColor}`}>{value}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-caption text-muted-foreground mb-1">Threshold</p>
          <p className="text-sm md:text-base font-data text-foreground">{threshold}</p>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;