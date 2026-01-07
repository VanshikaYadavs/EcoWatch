import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const ComparativeChart = ({ selectedCities, selectedParameters, timeRange, chartType }) => {
  const cityColors = {
    jaipur: '#2D7D32',
    jodhpur: '#FF6F00',
    udaipur: '#1976D2',
    kota: '#7B1FA2',
    ajmer: '#C2185B',
    bikaner: '#0097A7',
    alwar: '#689F38',
    bharatpur: '#F57C00',
    sikar: '#5D4037',
    pali: '#455A64',
    tonk: '#00897B',
    bhilwara: '#E64A19'
  };

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

  const generateMockData = useMemo(() => {
    const dataPoints = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];

    for (let i = 0; i < dataPoints; i++) {
      const point = { time: i };
      
      selectedCities?.forEach(cityId => {
        selectedParameters?.forEach(param => {
          let baseValue;
          switch(param) {
            case 'aqi':
              baseValue = Math.random() * 100 + 50;
              break;
            case 'noise':
              baseValue = Math.random() * 30 + 50;
              break;
            case 'temperature':
              baseValue = Math.random() * 15 + 20;
              break;
            case 'humidity':
              baseValue = Math.random() * 40 + 30;
              break;
            case 'pm25':
              baseValue = Math.random() * 50 + 20;
              break;
            case 'pm10':
              baseValue = Math.random() * 80 + 40;
              break;
            default:
              baseValue = Math.random() * 100;
          }
          point[`${cityId}_${param}`] = Math.round(baseValue * 10) / 10;
        });
      });
      
      data?.push(point);
    }
    
    return data;
  }, [selectedCities, selectedParameters, timeRange]);

  const getTimeLabel = (index) => {
    if (timeRange === '24h') return `${index}:00`;
    if (timeRange === '7d') return `Day ${index + 1}`;
    if (timeRange === '30d') return `Day ${index + 1}`;
    return `Day ${index + 1}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs font-caption text-muted-foreground mb-2">
            {getTimeLabel(label)}
          </p>
          {payload?.map((entry, index) => {
            const [cityId, param] = entry?.dataKey?.split('_');
            return (
              <div key={index} className="flex items-center justify-between gap-4 mb-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry?.color }}
                  />
                  <span className="text-xs text-foreground">
                    {cityNames?.[cityId]} - {param?.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-data font-medium text-foreground">
                  {entry?.value}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (selectedCities?.length === 0 || selectedParameters?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 md:p-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted">
            <Icon name="TrendingUp" size={32} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
              No Data to Display
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-md">
              Select at least one city and one parameter to view comparative analysis
            </p>
          </div>
        </div>
      </div>
    );
  }

  const ChartComponent = chartType === 'line' ? LineChart : BarChart;
  const DataComponent = chartType === 'line' ? Line : Bar;

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="TrendingUp" size={20} color="var(--color-primary)" />
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Comparative Analysis
          </h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
          <Icon name="Activity" size={14} color="var(--color-primary)" />
          <span className="text-xs font-caption text-primary">
            Live Data
          </span>
        </div>
      </div>
      <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Comparative Environmental Data Chart">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={generateMockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="time" 
              tickFormatter={getTimeLabel}
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => {
                const [cityId, param] = value?.split('_');
                return `${cityNames?.[cityId]} - ${param?.toUpperCase()}`;
              }}
            />
            {selectedCities?.map(cityId => 
              selectedParameters?.map(param => (
                <DataComponent
                  key={`${cityId}_${param}`}
                  type="monotone"
                  dataKey={`${cityId}_${param}`}
                  stroke={cityColors?.[cityId]}
                  fill={cityColors?.[cityId]}
                  strokeWidth={2}
                />
              ))
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {selectedCities?.map(cityId => (
          <div key={cityId} className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: cityColors?.[cityId] }}
            />
            <span className="text-xs font-medium text-foreground">
              {cityNames?.[cityId]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparativeChart;