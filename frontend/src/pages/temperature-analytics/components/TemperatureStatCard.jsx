import React from 'react';
import Icon from '../../../components/AppIcon';

const TemperatureStatCard = ({ 
  title, 
  value, 
  unit = '°C', 
  trend, 
  trendValue, 
  icon, 
  color = 'var(--color-primary)',
  description 
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return 'TrendingUp';
    if (trend === 'down') return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'var(--color-error)';
    if (trend === 'down') return 'var(--color-accent)';
    return 'var(--color-muted-foreground)';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon name={icon} size={20} color={color} />
          </div>
          <div>
            <p className="caption text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl md:text-3xl font-semibold text-foreground data-text">
                {value}
              </span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
            <Icon name={getTrendIcon()} size={14} color={getTrendColor()} />
            <span className="caption font-medium" style={{ color: getTrendColor() }}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      {description && (
        <p className="caption text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default TemperatureStatCard;