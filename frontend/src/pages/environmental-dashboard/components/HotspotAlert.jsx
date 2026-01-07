import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const HotspotAlert = ({ hotspots, onViewDetails, onAcknowledge }) => {
  if (!hotspots || hotspots?.length === 0) return null;

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: {
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        border: 'border-destructive',
        icon: 'AlertTriangle'
      },
      high: {
        bg: 'bg-error/10',
        text: 'text-error',
        border: 'border-error',
        icon: 'AlertCircle'
      },
      medium: {
        bg: 'bg-warning/10',
        text: 'text-warning',
        border: 'border-warning',
        icon: 'Info'
      }
    };
    return configs?.[severity] || configs?.medium;
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {hotspots?.map((hotspot) => {
        const config = getSeverityConfig(hotspot?.severity);
        
        return (
          <div
            key={hotspot?.id}
            className={`
              ${config?.bg} border ${config?.border} rounded-lg p-4 md:p-5
              transition-smooth hover:shadow-md
            `}
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div className={`p-2 rounded-lg ${config?.bg}`}>
                <Icon 
                  name={config?.icon} 
                  size={20} 
                  className="md:w-6 md:h-6"
                  color={`var(--color-${hotspot?.severity === 'critical' ? 'destructive' : hotspot?.severity === 'high' ? 'error' : 'warning'})`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className={`text-sm md:text-base font-semibold ${config?.text}`}>
                      {hotspot?.title}
                    </h4>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {hotspot?.location}
                    </p>
                  </div>
                  <span className={`
                    text-xs font-medium px-2 py-1 rounded-full
                    ${config?.bg} ${config?.text} uppercase whitespace-nowrap
                  `}>
                    {hotspot?.severity}
                  </span>
                </div>

                <p className="text-xs md:text-sm text-foreground mb-3">
                  {hotspot?.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-3">
                  <div>
                    <span className="text-xs text-muted-foreground">AQI</span>
                    <p className={`text-sm md:text-base font-medium ${config?.text}`}>
                      {hotspot?.aqi}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Noise</span>
                    <p className={`text-sm md:text-base font-medium ${config?.text}`}>
                      {hotspot?.noise} dB
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Temp</span>
                    <p className={`text-sm md:text-base font-medium ${config?.text}`}>
                      {hotspot?.temperature}°C
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Time</span>
                    <p className="text-sm md:text-base font-medium">
                      {hotspot?.time}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Eye"
                    iconPosition="left"
                    onClick={() => onViewDetails(hotspot?.id)}
                    className="flex-1 sm:flex-none"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    iconName="Check"
                    iconPosition="left"
                    onClick={() => onAcknowledge(hotspot?.id)}
                    className="flex-1 sm:flex-none"
                  >
                    Acknowledge
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HotspotAlert;