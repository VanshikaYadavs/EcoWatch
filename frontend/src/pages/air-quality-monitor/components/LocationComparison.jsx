import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import { displayLocation } from '../../../utils/location';

const LocationComparison = ({ comparisonData, selectedLocations }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4">
          <p className="font-medium text-foreground mb-2">{displayLocation(label, label)}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.fill }}
              />
              <span className="text-muted-foreground">{entry?.name}:</span>
              <span className="font-medium text-foreground">{entry?.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const pollutantColors = {
    pm25: '#F59E0B',
    pm10: '#EF4444',
    ozone: '#3B82F6',
    no2: '#9333EA'
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">Location Comparison</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Compare pollutant levels across {selectedLocations?.length} locations
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="TrendingUp" size={16} />
          <span>Analyzing pollution patterns</span>
        </div>
      </div>
      <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Location Comparison Bar Chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey={(d) => displayLocation(d.location, d.location)} 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
              label={{ value: 'Concentration', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Bar dataKey="pm25" fill={pollutantColors?.pm25} name="PM2.5 (µg/m³)" />
            <Bar dataKey="pm10" fill={pollutantColors?.pm10} name="PM10 (µg/m³)" />
            <Bar dataKey="ozone" fill={pollutantColors?.ozone} name="Ozone (ppb)" />
            <Bar dataKey="no2" fill={pollutantColors?.no2} name="NO₂ (ppb)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        {(() => { const n = Math.max(1, comparisonData?.length || 0); return (
        <>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pollutantColors?.pm25 }} />
            <p className="text-xs text-muted-foreground">PM2.5 Average</p>
          </div>
          <p className="text-xl font-bold data-text text-foreground">
            {Math.round((comparisonData?.reduce((sum, d) => sum + (d?.pm25 || 0), 0) / n))} µg/m³
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pollutantColors?.pm10 }} />
            <p className="text-xs text-muted-foreground">PM10 Average</p>
          </div>
          <p className="text-xl font-bold data-text text-foreground">
            {Math.round((comparisonData?.reduce((sum, d) => sum + (d?.pm10 || 0), 0) / n))} µg/m³
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pollutantColors?.ozone }} />
            <p className="text-xs text-muted-foreground">Ozone Average</p>
          </div>
          <p className="text-xl font-bold data-text text-foreground">
            {Math.round((comparisonData?.reduce((sum, d) => sum + (d?.ozone || 0), 0) / n))} ppb
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pollutantColors?.no2 }} />
            <p className="text-xs text-muted-foreground">NO₂ Average</p>
          </div>
          <p className="text-xl font-bold data-text text-foreground">
            {Math.round((comparisonData?.reduce((sum, d) => sum + (d?.no2 || 0), 0) / n))} ppb
          </p>
        </div>
        </>
        ); })()}
      </div>
    </div>
  );
};

export default LocationComparison;