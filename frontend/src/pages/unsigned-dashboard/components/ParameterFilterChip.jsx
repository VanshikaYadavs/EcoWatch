import React from 'react';
import Icon from '../../../components/AppIcon';

const ParameterFilterChip = ({ 
  label, 
  icon, 
  isActive, 
  onClick,
  count 
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full border transition-all duration-250 ease-out ${
        isActive
          ? 'bg-primary text-primary-foreground border-primary shadow-md'
          : 'bg-card text-foreground border-border hover:bg-muted hover:border-muted-foreground/20'
      }`}
    >
      <Icon name={icon} size={16} className="md:w-5 md:h-5" />
      <span className="text-sm md:text-base font-medium whitespace-nowrap">{label}</span>
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          isActive 
            ? 'bg-primary-foreground/20 text-primary-foreground' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
};

export default ParameterFilterChip;

