import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import { useLatestCityReadings, useComparativeSeries } from '../../../utils/dataHooks';

const DataTable = ({ selectedCities, selectedParameters, timeRange, refreshToken = 0 }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const { data: latestCityReadings } = useLatestCityReadings({ fallbackWindow: 200 });
  const idToName = useMemo(() => {
    const map = {};
    for (const r of latestCityReadings || []) {
      const id = String(r.location || '').toLowerCase().replace(/\s+/g, '-');
      map[id] = r.location;
    }
    return map;
  }, [latestCityReadings]);

  const parameterLabels = {
    aqi: 'AQI',
    noise: 'Noise (dB)',
    temperature: 'Temp (°C)',
    humidity: 'Humidity (%)',
    pm25: 'PM2.5 (µg/m³)',
    pm10: 'PM10 (µg/m³)',
    o3: 'Ozone (O₃)',
    no2: 'NO₂'
  };

  const chosenLocations = useMemo(() => {
    const names = (selectedCities || []).map(id => idToName[id]).filter(Boolean);
    return names;
  }, [selectedCities, idToName]);

  const { data: series, loading } = useComparativeSeries({ locations: chosenLocations, parameters: selectedParameters, timeRange, refreshToken });

  const generateTableData = useMemo(() => {
    return (selectedCities || []).map(cityId => {
      const cityName = idToName[cityId] || cityId;
      const row = { city: cityName, cityId };
      selectedParameters?.forEach(param => {
        const key = `${cityId}_${param}`;
        let current = null, previous = null;
        // scan from end for non-null values
        for (let i = (series || []).length - 1; i >= 0; i--) {
          const val = series[i]?.[key];
          if (val != null) {
            if (current == null) current = val; else { previous = val; break; }
          }
        }
        if (current == null) current = 0;
        if (previous == null) previous = current;
        const change = previous ? (((current - previous) / previous) * 100) : 0;
        row[param] = { current: Number(current), previous: Number(previous), change: Number(change.toFixed(1)) };
      });
      return row;
    });
  }, [selectedCities, selectedParameters, series, idToName]);

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
          {loading && (
            <span className="ml-2 text-xs md:text-sm text-muted-foreground">Refreshing…</span>
          )}
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

