import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ 
  title, 
  value, 
  unit, 
  status, 
  trend, 
  trendValue, 
  icon, 
  threshold,
  onClick 
}) => {
  const statusConfig = {
    good: {
      bg: 'bg-success/10',
      text: 'text-success',
      border: 'border-success/20'
    },
    moderate: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      border: 'border-warning/20'
    },
    poor: {
      bg: 'bg-error/10',
      text: 'text-error',
      border: 'border-error/20'
    },
    critical: {
      bg: 'bg-destructive/10',
      text: 'text-destructive',
      border: 'border-destructive/20'
    }
  };

  const config = statusConfig?.[status] || statusConfig?.good;

  return (
    <div 
      onClick={onClick}
      className={`
        bg-card rounded-lg border ${config?.border} p-4 md:p-6 
        transition-smooth hover:shadow-md cursor-pointer
        ${config?.bg}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 md:p-3 rounded-lg ${config?.bg}`}>
          <Icon name={icon} size={20} className="md:w-6 md:h-6" color={`var(--color-${status === 'good' ? 'success' : status === 'moderate' ? 'warning' : 'error'})`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${config?.text}`}>
            <Icon 
              name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
              size={16} 
            />
            <span className="text-xs md:text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      <h3 className="text-xs md:text-sm text-muted-foreground mb-2">{title}</h3>
      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-2xl md:text-3xl lg:text-4xl font-semibold ${config?.text}`}>
          {value}
        </span>
        <span className="text-sm md:text-base text-muted-foreground">{unit}</span>
      </div>
      {threshold && (
        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
          <Icon name="AlertCircle" size={14} />
          <span>Threshold: {threshold}</span>
        </div>
      )}
      <div className={`mt-3 pt-3 border-t ${config?.border}`}>
        <span className={`text-xs md:text-sm font-medium ${config?.text} uppercase`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default MetricCard;