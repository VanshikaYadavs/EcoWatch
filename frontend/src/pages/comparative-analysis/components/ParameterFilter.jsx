import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ParameterFilter = ({ selectedParameters, onParameterToggle }) => {
  const parameters = [
    { id: 'aqi', name: 'Air Quality Index', icon: 'Wind', color: 'var(--color-primary)' },
    { id: 'noise', name: 'Noise Levels', icon: 'Volume2', color: 'var(--color-accent)' },
    { id: 'temperature', name: 'Temperature', icon: 'Thermometer', color: 'var(--color-error)' },
    { id: 'humidity', name: 'Humidity', icon: 'Droplets', color: 'var(--color-secondary)' },
    { id: 'pm25', name: 'PM2.5', icon: 'CloudFog', color: 'var(--color-warning)' },
    { id: 'pm10', name: 'PM10', icon: 'Cloud', color: 'var(--color-muted-foreground)' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Filter" size={20} color="var(--color-primary)" />
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          Environmental Parameters
        </h3>
      </div>
      <p className="text-xs md:text-sm text-muted-foreground mb-4">
        Select parameters to include in comparative analysis
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {parameters?.map((param) => {
          const isSelected = selectedParameters?.includes(param?.id);
          
          return (
            <button
              key={param?.id}
              onClick={() => onParameterToggle(param?.id)}
              className={`flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg border transition-all duration-250 ${
                isSelected
                  ? 'border-primary bg-primary/10' :'border-border bg-card hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg ${
                isSelected ? 'bg-primary/20' : 'bg-muted'
              }`}>
                <Icon 
                  name={param?.icon} 
                  size={20} 
                  color={isSelected ? param?.color : 'var(--color-muted-foreground)'} 
                />
              </div>
              <span className={`text-xs md:text-sm font-medium text-center ${
                isSelected ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {param?.name}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          iconName="CheckSquare"
          iconPosition="left"
          onClick={() => {
            const allIds = parameters?.map(p => p?.id);
            if (selectedParameters?.length === parameters?.length) {
              onParameterToggle(null, []);
            } else {
              onParameterToggle(null, allIds);
            }
          }}
        >
          {selectedParameters?.length === parameters?.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
    </div>
  );
};

export default ParameterFilter;