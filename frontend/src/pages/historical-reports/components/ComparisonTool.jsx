import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ComparisonTool = () => {
  const [comparisonType, setComparisonType] = useState('location');
  const [selectedItems, setSelectedItems] = useState([]);

  const comparisonTypes = [
    { value: 'location', label: 'Compare Locations' },
    { value: 'timeperiod', label: 'Compare Time Periods' },
    { value: 'parameter', label: 'Compare Parameters' }
  ];

  const locationOptions = [
    { value: 'downtown', label: 'MI Road, Jaipur' },
    { value: 'industrial', label: 'Industrial Area, Tonk' },
    { value: 'residential', label: 'Lake Pichola, Udaipur' },
    { value: 'commercial', label: 'Pushkar Road, Ajmer' }
  ];

  const comparisonData = [
    { category: 'AQI', downtown: 85, industrial: 142, residential: 65, commercial: 95 },
    { category: 'Noise (dB)', downtown: 72, industrial: 88, residential: 58, commercial: 75 },
    { category: 'Temp (°F)', downtown: 68, industrial: 72, residential: 66, commercial: 69 },
    { category: 'Humidity (%)', downtown: 62, industrial: 58, residential: 65, commercial: 61 }
  ];

  const insights = [
    {
      icon: 'TrendingUp',
      color: '#DC2626',
      title: 'Industrial Area (Tonk) Shows Highest Pollution',
      description: 'AQI levels near industrial areas are higher than lakeside zones, indicating need for targeted emission controls.'
    },
    {
      icon: 'Volume2',
      color: '#D97706',
      title: 'Noise Peaks Near Busy Corridors',
      description: 'Peak-hour noise is highest near key corridors like MI Road and Clock Tower. Monitoring and enforcement are recommended.'
    },
    {
      icon: 'Thermometer',
      color: '#059669',
      title: 'Temperature Variations Minimal',
      description: 'Temperature differences across locations remain within 6°F, showing consistent climate patterns.'
    }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{payload?.[0]?.payload?.category}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry?.name}: <span className="font-semibold" style={{ color: entry?.color }}>{entry?.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon name="GitCompare" size={20} color="var(--color-accent)" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">Comparison Tool</h2>
            <p className="text-sm text-muted-foreground mt-1">Analyze differences between locations, time periods, and parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          <Select
            label="Comparison Type"
            options={comparisonTypes}
            value={comparisonType}
            onChange={setComparisonType}
          />
          <Select
            label="Select Items to Compare"
            multiple
            searchable
            options={locationOptions}
            value={selectedItems}
            onChange={setSelectedItems}
            placeholder="Choose locations"
          />
        </div>

        <div className="w-full h-80 md:h-96 mb-6" aria-label="Comparison chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="category" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="downtown" fill="#3B82F6" radius={[4, 4, 0, 0]} name="MI Road, Jaipur" />
              <Bar dataKey="industrial" fill="#DC2626" radius={[4, 4, 0, 0]} name="Industrial Area, Tonk" />
              <Bar dataKey="residential" fill="#059669" radius={[4, 4, 0, 0]} name="Lake Pichola, Udaipur" />
              <Bar dataKey="commercial" fill="#D97706" radius={[4, 4, 0, 0]} name="Pushkar Road, Ajmer" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <Button variant="outline" iconName="Download" iconPosition="left" fullWidth>
          Export Comparison Report
        </Button>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4">Automated Insights</h3>
        <div className="space-y-4">
          {insights?.map((insight, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${insight?.color}20` }}>
                <Icon name={insight?.icon} size={20} color={insight?.color} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-foreground mb-1">{insight?.title}</h4>
                <p className="text-sm text-muted-foreground">{insight?.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonTool;

