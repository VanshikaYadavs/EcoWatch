import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import { useLatestCityReadings, useComparativeSeries } from '../../../utils/dataHooks';

const CorrelationAnalysis = ({ selectedCities, selectedParameters, refreshToken = 0 }) => {
  const [xParameter, setXParameter] = React.useState('aqi');
  const [yParameter, setYParameter] = React.useState('temperature');

  const parameterOptions = selectedParameters?.map(param => ({
    value: param,
    label: param === 'aqi' ? 'Air Quality Index' :
           param === 'noise' ? 'Noise Levels' :
           param === 'temperature' ? 'Temperature' :
           param === 'humidity' ? 'Humidity' :
           param === 'pm25'? 'PM2.5' : 'PM10'
  }));

  const { data: latestCityReadings } = useLatestCityReadings({ fallbackWindow: 200 });
  const idToName = useMemo(() => {
    const map = {};
    for (const r of latestCityReadings || []) {
      const id = String(r.location || '').toLowerCase().replace(/\s+/g, '-');
      map[id] = r.location;
    }
    return map;
  }, [latestCityReadings]);

  const chosenLocations = useMemo(() => (selectedCities || []).map(id => idToName[id]).filter(Boolean), [selectedCities, idToName]);
  const { data: series, loading } = useComparativeSeries({ locations: chosenLocations, parameters: [xParameter, yParameter], timeRange: '24h', refreshToken });

  const generateCorrelationData = useMemo(() => {
    const points = [];
    for (const row of series || []) {
      for (const cityId of selectedCities || []) {
        const x = row?.[`${cityId}_${xParameter}`];
        const y = row?.[`${cityId}_${yParameter}`];
        if (x != null && y != null) {
          points.push({ city: idToName[cityId] || cityId, x: Number(x), y: Number(y), z: 100 });
        }
      }
    }
    return points;
  }, [series, selectedCities, xParameter, yParameter, idToName]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs font-semibold text-foreground mb-2">
            {data?.city}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">
                {parameterOptions?.find(p => p?.value === xParameter)?.label}:
              </span>
              <span className="text-xs font-data font-medium text-foreground">
                {data?.x}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">
                {parameterOptions?.find(p => p?.value === yParameter)?.label}:
              </span>
              <span className="text-xs font-data font-medium text-foreground">
                {data?.y}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (selectedCities?.length === 0 || selectedParameters?.length < 2) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 md:p-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted">
            <Icon name="GitCompare" size={32} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
              Correlation Analysis Unavailable
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-md">
              Select at least one city and two parameters to view correlation analysis
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="GitCompare" size={20} color="var(--color-primary)" />
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          Correlation Analysis
        </h3>
      </div>
      <p className="text-xs md:text-sm text-muted-foreground mb-4">
        Analyze relationships between different environmental parameters
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          label="X-Axis Parameter"
          options={parameterOptions}
          value={xParameter}
          onChange={setXParameter}
        />
        <Select
          label="Y-Axis Parameter"
          options={parameterOptions}
          value={yParameter}
          onChange={setYParameter}
        />
      </div>
      <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Correlation Scatter Plot">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name={parameterOptions?.find(p => p?.value === xParameter)?.label}
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name={parameterOptions?.find(p => p?.value === yParameter)?.label}
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <ZAxis type="number" dataKey="z" range={[50, 400]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              data={generateCorrelationData} 
              fill="var(--color-primary)" 
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs md:text-sm text-muted-foreground">Refreshing…</span>
          </div>
        )}
      </div>
      <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-start gap-2">
          <Icon name="Info" size={16} color="var(--color-primary)" className="mt-0.5 flex-shrink-0" />
          <p className="text-xs md:text-sm text-muted-foreground">
            Bubble size represents data point significance. Larger bubbles indicate higher measurement confidence or data density.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CorrelationAnalysis;

