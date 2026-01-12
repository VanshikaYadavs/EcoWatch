import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import { useLatestCityReadings, useComparativeSeries } from '../../../utils/dataHooks';

const StatisticalView = ({ selectedCities, selectedParameters, refreshToken = 0 }) => {
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
    aqi: 'Air Quality Index',
    noise: 'Noise Levels',
    temperature: 'Temperature',
    humidity: 'Humidity',
    pm25: 'PM2.5',
    pm10: 'PM10',
    o3: 'Ozone (O₃)',
    no2: 'NO₂'
  };

  const chosenLocations = useMemo(() => (selectedCities || []).map(id => idToName[id]).filter(Boolean), [selectedCities, idToName]);
  const { data: series, loading } = useComparativeSeries({ locations: chosenLocations, parameters: selectedParameters, timeRange: '24h', refreshToken });

  const statistics = useMemo(() => {
    return selectedParameters?.map(param => {
      const values = (selectedCities || []).map(cityId => {
        const key = `${cityId}_${param}`;
        const vals = (series || []).map(r => r[key]).filter(v => v != null);
        if (!vals.length) return 0;
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return Number(avg.toFixed(1));
      });
      const average = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '0.0';
      const max = Math.max(...values);
      const min = Math.min(...values);
      const maxIdx = values.indexOf(max);
      const minIdx = values.indexOf(min);
      const maxCity = idToName[selectedCities?.[maxIdx]] || selectedCities?.[maxIdx];
      const minCity = idToName[selectedCities?.[minIdx]] || selectedCities?.[minIdx];
      return {
        parameter: param,
        label: parameterLabels?.[param],
        average,
        max,
        min,
        maxCity,
        minCity,
        range: Number((max - min).toFixed(1))
      };
    });
  }, [selectedParameters, selectedCities, series, idToName]);

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
        {loading && (
          <span className="ml-2 text-xs md:text-sm text-muted-foreground">Refreshing…</span>
        )}
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