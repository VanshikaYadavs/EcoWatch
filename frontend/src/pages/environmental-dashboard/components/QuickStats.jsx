import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats?.map((stat, index) => (
        <div
          key={index}
          className="bg-card rounded-lg border border-border p-3 md:p-4 transition-smooth hover:shadow-md"
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon 
              name={stat?.icon} 
              size={16} 
              className="md:w-5 md:h-5"
              color="var(--color-primary)" 
            />
            <span className="text-xs md:text-sm text-muted-foreground">
              {stat?.label}
            </span>
          </div>
          <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
            {stat?.value}
          </p>
          {stat?.change && (
            <div className={`
              flex items-center gap-1 mt-2
              ${stat?.changeType === 'positive' ? 'text-success' : 'text-error'}
            `}>
              <Icon 
                name={stat?.changeType === 'positive' ? 'ArrowUp' : 'ArrowDown'} 
                size={14} 
              />
              <span className="text-xs md:text-sm font-medium">{stat?.change}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuickStats;