import React from 'react';
import Icon from '../../../components/AppIcon';

const StatisticalView = ({ selectedCities, selectedParameters }) => {
  const cityNames = {
    jaipur: 'Jaipur',
    jodhpur: 'Jodhpur',
    udaipur: 'Udaipur',
    kota: 'Kota',
    ajmer: 'Ajmer',
    bikaner: 'Bikaner',
    alwar: 'Alwar',
    bharatpur: 'Bharatpur',
    sikar: 'Sikar',
    pali: 'Pali',
    tonk: 'Tonk',
    bhilwara: 'Bhilwara'
  };

  const parameterLabels = {
    aqi: 'Air Quality Index',
    noise: 'Noise Levels',
    temperature: 'Temperature',
    humidity: 'Humidity',
    pm25: 'PM2.5',
    pm10: 'PM10'
  };

  const generateStatistics = () => {
    return selectedParameters?.map(param => {
      const values = selectedCities?.map(() => {
        switch(param) {
          case 'aqi':
            return Math.round(Math.random() * 100 + 50);
          case 'noise':
            return Math.round(Math.random() * 30 + 50);
          case 'temperature':
            return Math.round((Math.random() * 15 + 20) * 10) / 10;
          case 'humidity':
            return Math.round(Math.random() * 40 + 30);
          case 'pm25':
            return Math.round(Math.random() * 50 + 20);
          case 'pm10':
            return Math.round(Math.random() * 80 + 40);
          default:
            return Math.round(Math.random() * 100);
        }
      });

      const average = (values?.reduce((a, b) => a + b, 0) / values?.length)?.toFixed(1);
      const max = Math.max(...values);
      const min = Math.min(...values);
      const maxCity = cityNames?.[selectedCities?.[values?.indexOf(max)]];
      const minCity = cityNames?.[selectedCities?.[values?.indexOf(min)]];

      return {
        parameter: param,
        label: parameterLabels?.[param],
        average,
        max,
        min,
        maxCity,
        minCity,
        range: (max - min)?.toFixed(1)
      };
    });
  };

  const statistics = generateStatistics();

  if (selectedCities?.length === 0 || selectedParameters?.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="BarChart3" size={20} color="var(--color-primary)" />
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          Statistical Summary
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statistics?.map((stat) => (
          <div key={stat?.parameter} className="p-4 rounded-lg border border-border bg-muted/30">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              {stat?.label}
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="TrendingUp" size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Average</span>
                </div>
                <span className="text-sm font-data font-medium text-foreground">
                  {stat?.average}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="ArrowUp" size={14} className="text-error" />
                  <span className="text-xs text-muted-foreground">Highest</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-data font-medium text-error">
                    {stat?.max}
                  </span>
                  <span className="text-xs font-caption text-muted-foreground">
                    {stat?.maxCity}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="ArrowDown" size={14} className="text-success" />
                  <span className="text-xs text-muted-foreground">Lowest</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-data font-medium text-success">
                    {stat?.min}
                  </span>
                  <span className="text-xs font-caption text-muted-foreground">
                    {stat?.minCity}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Maximize2" size={14} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Range</span>
                  </div>
                  <span className="text-sm font-data font-medium text-foreground">
                    {stat?.range}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticalView;