import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TemperatureChart = ({ data, chartType = 'line', showHeatIndex = false }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="caption font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              />
              <span className="caption text-muted-foreground">
                {entry?.name}: <span className="font-medium text-foreground">{entry?.value}°C</span>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
  const DataComponent = chartType === 'area' ? Area : Line;

  return (
    <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Temperature trend chart">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="time" 
            stroke="var(--color-muted-foreground)"
            style={{ fontSize: '12px', fontFamily: 'var(--font-caption)' }}
          />
          <YAxis 
            stroke="var(--color-muted-foreground)"
            style={{ fontSize: '12px', fontFamily: 'var(--font-caption)' }}
            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              fontSize: '12px', 
              fontFamily: 'var(--font-caption)',
              paddingTop: '16px'
            }}
          />
          <DataComponent
            type="monotone"
            dataKey="current"
            stroke="var(--color-primary)"
            fill="var(--color-primary)"
            fillOpacity={chartType === 'area' ? 0.2 : 1}
            strokeWidth={2}
            name="Current Temp"
            dot={{ fill: 'var(--color-primary)', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <DataComponent
            type="monotone"
            dataKey="high"
            stroke="var(--color-error)"
            fill="var(--color-error)"
            fillOpacity={chartType === 'area' ? 0.1 : 1}
            strokeWidth={2}
            name="Daily High"
            dot={{ fill: 'var(--color-error)', r: 3 }}
          />
          <DataComponent
            type="monotone"
            dataKey="low"
            stroke="var(--color-accent)"
            fill="var(--color-accent)"
            fillOpacity={chartType === 'area' ? 0.1 : 1}
            strokeWidth={2}
            name="Daily Low"
            dot={{ fill: 'var(--color-accent)', r: 3 }}
          />
          {showHeatIndex && (
            <DataComponent
              type="monotone"
              dataKey="heatIndex"
              stroke="var(--color-warning)"
              fill="var(--color-warning)"
              fillOpacity={chartType === 'area' ? 0.1 : 1}
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Heat Index"
              dot={{ fill: 'var(--color-warning)', r: 3 }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default TemperatureChart;