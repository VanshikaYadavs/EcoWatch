import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const CityEnvironmentCard = ({ 
  cityName, 
  region, 
  image, 
  imageAlt,
  aqi, 
  temperature, 
  humidity, 
  noiseLevel,
  status,
  onClick 
}) => {
  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-success', bg: 'bg-success/10' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-warning', bg: 'bg-warning/10' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-warning', bg: 'bg-warning/10' };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'text-error', bg: 'bg-error/10' };
    return { label: 'Very Unhealthy', color: 'text-error', bg: 'bg-error/10' };
  };

  const aqiStatus = getAQIStatus(aqi);

  return (
    <div 
      onClick={onClick}
      className="flex-shrink-0 w-80 md:w-96 lg:w-[420px] bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-250 ease-out cursor-pointer"
    >
      <div className="relative h-40 md:h-48 lg:h-56 overflow-hidden">
        <Image 
          src={image} 
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
          <h3 className="text-xl md:text-2xl font-bold text-primary-foreground mb-1">{cityName}</h3>
          <p className="text-xs md:text-sm text-primary-foreground/80 font-caption">{region} Rajasthan</p>
        </div>
        <div className={`absolute top-3 right-3 md:top-4 md:right-4 px-3 py-1.5 rounded-full ${aqiStatus?.bg} backdrop-blur-sm`}>
          <span className={`text-xs md:text-sm font-semibold ${aqiStatus?.color}`}>{aqiStatus?.label}</span>
        </div>
      </div>
      <div className="p-4 md:p-5 lg:p-6">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Icon name="Wind" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <p className="text-xs font-caption text-muted-foreground">AQI</p>
              <p className="text-lg md:text-xl font-bold font-data text-foreground">{aqi}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
              <Icon name="Thermometer" size={20} color="var(--color-accent)" />
            </div>
            <div>
              <p className="text-xs font-caption text-muted-foreground">Temp</p>
              <p className="text-lg md:text-xl font-bold font-data text-foreground">{temperature}°C</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/10">
              <Icon name="Droplets" size={20} color="var(--color-secondary)" />
            </div>
            <div>
              <p className="text-xs font-caption text-muted-foreground">Humidity</p>
              <p className="text-lg md:text-xl font-bold font-data text-foreground">{humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10">
              <Icon name="Volume2" size={20} color="var(--color-warning)" />
            </div>
            <div>
              <p className="text-xs font-caption text-muted-foreground">Noise</p>
              <p className="text-lg md:text-xl font-bold font-data text-foreground">{noiseLevel} dB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityEnvironmentCard;