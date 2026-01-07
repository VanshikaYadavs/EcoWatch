import React from 'react';
import Icon from '../../../components/AppIcon';

const EnvironmentalMetricCard = ({ 
  title, 
  value, 
  unit, 
  status, 
  trend, 
  icon, 
  description,
  onClick 
}) => {
  const statusConfig = {
    good: {
      bgColor: 'bg-success/10',
      textColor: 'text-success',
      borderColor: 'border-success/20',
      label: 'Good'
    },
    moderate: {
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      borderColor: 'border-warning/20',
      label: 'Moderate'
    },
    poor: {
      bgColor: 'bg-error/10',
      textColor: 'text-error',
      borderColor: 'border-error/20',
      label: 'Poor'
    },
    unhealthy: {
      bgColor: 'bg-error/10',
      textColor: 'text-error',
      borderColor: 'border-error/20',
      label: 'Unhealthy'
    }
  };

  const currentStatus = statusConfig?.[status] || statusConfig?.moderate;

  return (
    <div 
      onClick={onClick}
      className={`flex-shrink-0 w-72 md:w-80 lg:w-96 p-4 md:p-5 lg:p-6 rounded-xl border ${currentStatus?.borderColor} ${currentStatus?.bgColor} hover:shadow-lg transition-all duration-250 ease-out ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg ${currentStatus?.bgColor}`}>
            <Icon name={icon} size={20} color={currentStatus?.textColor?.replace('text-', 'var(--color-')} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-semibold text-foreground">{title}</h3>
            <span className={`text-xs font-caption ${currentStatus?.textColor}`}>
              {currentStatus?.label}
            </span>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-error' : trend === 'down' ? 'text-success' : 'text-muted-foreground'}`}>
            <Icon name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} size={16} />
          </div>
        )}
      </div>
      <div className="mb-2 md:mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl md:text-4xl lg:text-5xl font-bold font-data text-foreground">{value}</span>
          <span className="text-base md:text-lg text-muted-foreground font-medium">{unit}</span>
        </div>
      </div>
      {description && (
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{description}</p>
      )}
    </div>
  );
};

export default EnvironmentalMetricCard;