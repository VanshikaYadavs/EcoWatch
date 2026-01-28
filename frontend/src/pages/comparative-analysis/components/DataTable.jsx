import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const DataTable = ({ selectedCities, selectedParameters, timeRange }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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
    aqi: 'AQI',
    noise: 'Noise (dB)',
    temperature: 'Temp (°C)',
    humidity: 'Humidity (%)',
    pm25: 'PM2.5 (µg/m³)',
    pm10: 'PM10 (µg/m³)'
  };

  const generateTableData = useMemo(() => {
    return selectedCities?.map(cityId => {
      const row = { city: cityNames?.[cityId], cityId };
      
      selectedParameters?.forEach(param => {
        let current, previous;
        switch(param) {
          case 'aqi':
            current = Math.round(Math.random() * 100 + 50);
            previous = Math.round(Math.random() * 100 + 50);
            break;
          case 'noise':
            current = Math.round(Math.random() * 30 + 50);
            previous = Math.round(Math.random() * 30 + 50);
            break;
          case 'temperature':
            current = Math.round((Math.random() * 15 + 20) * 10) / 10;
            previous = Math.round((Math.random() * 15 + 20) * 10) / 10;
            break;
          case 'humidity':
            current = Math.round(Math.random() * 40 + 30);
            previous = Math.round(Math.random() * 40 + 30);
            break;
          case 'pm25':
            current = Math.round(Math.random() * 50 + 20);
            previous = Math.round(Math.random() * 50 + 20);
            break;
          case 'pm10':
            current = Math.round(Math.random() * 80 + 40);
            previous = Math.round(Math.random() * 80 + 40);
            break;
          default:
            current = Math.round(Math.random() * 100);
            previous = Math.round(Math.random() * 100);
        }
        
        const change = ((current - previous) / previous * 100)?.toFixed(1);
        row[param] = { current, previous, change: parseFloat(change) };
      });
      
      return row;
    });
  }, [selectedCities, selectedParameters]);

  const sortedData = useMemo(() => {
    if (!sortConfig?.key) return generateTableData;

    return [...generateTableData]?.sort((a, b) => {
      let aValue, bValue;

      if (sortConfig?.key === 'city') {
        aValue = a?.city;
        bValue = b?.city;
      } else {
        aValue = a?.[sortConfig?.key]?.current || 0;
        bValue = b?.[sortConfig?.key]?.current || 0;
      }

      if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [generateTableData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-error';
    if (change < 0) return 'text-success';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return 'TrendingUp';
    if (change < 0) return 'TrendingDown';
    return 'Minus';
  };

  if (selectedCities?.length === 0 || selectedParameters?.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Table" size={20} color="var(--color-primary)" />
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Detailed Comparison Data
          </h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th 
                onClick={() => handleSort('city')}
                className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>City</span>
                  {sortConfig?.key === 'city' && (
                    <Icon 
                      name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                      size={14} 
                    />
                  )}
                </div>
              </th>
              {selectedParameters?.map(param => (
                <th 
                  key={param}
                  onClick={() => handleSort(param)}
                  className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <span>{parameterLabels?.[param]}</span>
                    {sortConfig?.key === param && (
                      <Icon 
                        name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                        size={14} 
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedData?.map((row, index) => (
              <tr key={row?.cityId} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 text-xs md:text-sm font-medium text-foreground whitespace-nowrap">
                  {row?.city}
                </td>
                {selectedParameters?.map(param => {
                  const data = row?.[param];
                  return (
                    <td key={param} className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs md:text-sm font-data font-medium text-foreground">
                          {data?.current}
                        </span>
                        <div className="flex items-center gap-1">
                          <Icon 
                            name={getChangeIcon(data?.change)} 
                            size={12} 
                            className={getChangeColor(data?.change)}
                          />
                          <span className={`text-xs font-data ${getChangeColor(data?.change)}`}>
                            {Math.abs(data?.change)}%
                          </span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border bg-muted/50">
        <p className="text-xs font-caption text-muted-foreground text-center">
          Percentage changes compared to previous {timeRange === '24h' ? '24 hours' : timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
        </p>
      </div>
    </div>
  );
};

export default DataTable;