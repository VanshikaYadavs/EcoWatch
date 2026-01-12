import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import { useLatestCityReadings, useComparativeSeries } from '../../../utils/dataHooks';

const ComparativeChart = ({ selectedCities, selectedParameters, timeRange, chartType, refreshToken = 0 }) => {
  const { data: latestCityReadings } = useLatestCityReadings({ fallbackWindow: 200 });

  // Map normalized id -> actual location name from live data
  const idToName = useMemo(() => {
    const map = {};
    for (const r of latestCityReadings || []) {
      const id = String(r.location || '').toLowerCase().replace(/\s+/g, '-');
      map[id] = r.location;
    }
    return map;
  }, [latestCityReadings]);

  const chosenLocations = useMemo(() => {
    const names = (selectedCities || []).map(id => idToName[id]).filter(Boolean);
    if (names.length) return names;
    // Fallback to top 3 cities from latest readings
    return (latestCityReadings || []).slice(0, 3).map(r => r.location);
  }, [selectedCities, idToName, latestCityReadings]);

  const { data: liveData, loading } = useComparativeSeries({ locations: chosenLocations, parameters: selectedParameters, timeRange, refreshToken });

  // Generate color palette for dynamic cities
  const palette = ['#2D7D32', '#FF6F00', '#1976D2', '#7B1FA2', '#C2185B', '#0097A7', '#689F38', '#F57C00', '#5D4037', '#455A64', '#00897B', '#E64A19'];
  const cityColors = useMemo(() => {
    const map = {};
    chosenLocations.forEach((name, idx) => {
      const id = String(name).toLowerCase().replace(/\s+/g, '-');
      map[id] = palette[idx % palette.length];
    });
    return map;
  }, [chosenLocations]);

  const cityNames = useMemo(() => {
    const map = {};
    chosenLocations.forEach((name) => {
      const id = String(name).toLowerCase().replace(/\s+/g, '-');
      map[id] = name;
    });
    return map;
  }, [chosenLocations]);

  const chartData = useMemo(() => {
    if (liveData?.length) return liveData;
    // Minimal fallback: empty dataset
    return [];
  }, [liveData]);

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

  if (chosenLocations?.length === 0 || selectedParameters?.length === 0) {
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
      <div className="w-full h-64 md:h-80 lg:h-96 relative" aria-label="Comparative Environmental Data Chart">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="time" 
              tickFormatter={(t) => t}
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
            {chosenLocations?.map(name => {
              const cityId = String(name).toLowerCase().replace(/\s+/g, '-');
              return selectedParameters?.map(param => (
                <DataComponent
                  key={`${cityId}_${param}`}
                  type="monotone"
                  dataKey={`${cityId}_${param}`}
                  stroke={cityColors?.[cityId]}
                  fill={cityColors?.[cityId]}
                  strokeWidth={2}
                />
              ));
            })}
          </ChartComponent>
        </ResponsiveContainer>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <span className="text-xs md:text-sm text-muted-foreground">Refreshing data…</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {chosenLocations?.map(name => {
          const cityId = String(name).toLowerCase().replace(/\s+/g, '-');
          return (
          <div key={cityId} className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: cityColors?.[cityId] }}
            />
            <span className="text-xs font-medium text-foreground">
              {cityNames?.[cityId]}
            </span>
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default ComparativeChart;