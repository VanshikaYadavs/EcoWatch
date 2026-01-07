import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickStatsPanel = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {stats?.map((stat, index) => (
        <div 
          key={index}
          className="p-4 md:p-5 lg:p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-all duration-250 ease-out"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg ${stat?.bgColor}`}>
              <Icon name={stat?.icon} size={20} color={stat?.color} className="md:w-6 md:h-6" />
            </div>
            <h4 className="text-xs md:text-sm font-caption text-muted-foreground">{stat?.label}</h4>
          </div>
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold font-data text-foreground mb-1">{stat?.value}</p>
          {stat?.change && (
            <div className={`flex items-center gap-1 text-xs md:text-sm ${stat?.changeType === 'positive' ? 'text-success' : 'text-error'}`}>
              <Icon name={stat?.changeType === 'positive' ? 'TrendingDown' : 'TrendingUp'} size={14} />
              <span>{stat?.change}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuickStatsPanel;