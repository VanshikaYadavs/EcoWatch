import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

const NoiseTimelineChart = ({ data, timeRange }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const value = payload?.[0]?.value;
      const getZoneLabel = (val) => {
        if (val < 55) return 'Acceptable';
        if (val < 70) return 'Concerning';
        return 'Harmful';
      };

      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">
            {payload?.[0]?.payload?.time}
          </p>
          <p className="text-lg font-bold text-foreground">
            {value} dB
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {getZoneLabel(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
          Noise Level Timeline
        </h2>
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <span className="text-muted-foreground">Time Range:</span>
          <span className="font-medium text-foreground">{timeRange}</span>
        </div>
      </div>
      <div className="mb-4 md:mb-6 flex flex-wrap items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-success"></div>
          <span className="text-xs md:text-sm text-muted-foreground">Acceptable (&lt;55 dB)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-warning"></div>
          <span className="text-xs md:text-sm text-muted-foreground">Concerning (55-70 dB)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-error"></div>
          <span className="text-xs md:text-sm text-muted-foreground">Harmful (&gt;70 dB)</span>
        </div>
      </div>
      <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Noise Level Timeline Chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="noiseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="var(--color-muted-foreground)"
              tick={{ fontSize: 12 }}
              tickMargin={8}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              tick={{ fontSize: 12 }}
              tickMargin={8}
              domain={[0, 100]}
              label={{ value: 'dB', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'var(--color-muted-foreground)' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={55} stroke="var(--color-success)" strokeDasharray="5 5" strokeWidth={2} />
            <ReferenceLine y={70} stroke="var(--color-error)" strokeDasharray="5 5" strokeWidth={2} />
            <Area 
              type="monotone" 
              dataKey="level" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              fill="url(#noiseGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="text-center">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">Min Level</div>
            <div className="text-lg md:text-xl font-bold text-foreground">
              {Math.min(...data?.map(d => d?.level))} dB
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">Max Level</div>
            <div className="text-lg md:text-xl font-bold text-foreground">
              {Math.max(...data?.map(d => d?.level))} dB
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">Avg Level</div>
            <div className="text-lg md:text-xl font-bold text-foreground">
              {(data?.reduce((sum, d) => sum + d?.level, 0) / data?.length)?.toFixed(1)} dB
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">Data Points</div>
            <div className="text-lg md:text-xl font-bold text-foreground">
              {data?.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoiseTimelineChart;