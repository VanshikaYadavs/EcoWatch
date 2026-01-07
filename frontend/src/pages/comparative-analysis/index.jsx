import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import CitySelector from './components/CitySelector';
import ParameterFilter from './components/ParameterFilter';
import TimeRangeSelector from './components/TimeRangeSelector';
import ComparativeChart from './components/ComparativeChart';
import DataTable from './components/DataTable';
import StatisticalView from './components/StatisticalView';
import ExportControls from './components/ExportControls';
import CorrelationAnalysis from './components/CorrelationAnalysis';

const ComparativeAnalysis = () => {
  const navigate = useNavigate();
  const [selectedCities, setSelectedCities] = useState(['jaipur', 'udaipur']);
  const [selectedParameters, setSelectedParameters] = useState(['aqi', 'temperature']);
  const [timeRange, setTimeRange] = useState('7d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [chartType, setChartType] = useState('line');
  const [activeView, setActiveView] = useState('chart');

  const handleCityToggle = (cityId) => {
    setSelectedCities(prev => {
      if (prev?.includes(cityId)) {
        return prev?.filter(id => id !== cityId);
      } else {
        return [...prev, cityId];
      }
    });
  };

  const handleParameterToggle = (parameterId, allIds = null) => {
    if (allIds !== null) {
      setSelectedParameters(allIds);
    } else {
      setSelectedParameters(prev => {
        if (prev?.includes(parameterId)) {
          return prev?.filter(id => id !== parameterId);
        } else {
          return [...prev, parameterId];
        }
      });
    }
  };

  const handleCustomDateChange = (type, value) => {
    if (type === 'start') {
      setCustomStartDate(value);
    } else {
      setCustomEndDate(value);
    }
  };

  const views = [
    { id: 'chart', label: 'Charts', icon: 'TrendingUp' },
    { id: 'table', label: 'Data Table', icon: 'Table' },
    { id: 'statistics', label: 'Statistics', icon: 'BarChart3' },
    { id: 'correlation', label: 'Correlation', icon: 'GitCompare' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => navigate('/environmental-dashboard')}
                    className="p-2 rounded-lg hover:bg-muted transition-all duration-250"
                  >
                    <Icon name="ArrowLeft" size={20} />
                  </button>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground">
                    Comparative Analysis
                  </h1>
                </div>
                <p className="text-sm md:text-base text-muted-foreground ml-12">
                  Compare environmental trends across multiple Rajasthan cities
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="RefreshCw"
                  iconPosition="left"
                  onClick={() => {
                    setSelectedCities(['jaipur', 'udaipur']);
                    setSelectedParameters(['aqi', 'temperature']);
                    setTimeRange('7d');
                    setChartType('line');
                    setActiveView('chart');
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  iconName="Bell"
                  iconPosition="left"
                  onClick={() => navigate('/alert-management')}
                >
                  Alerts
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6">
          <CitySelector
            selectedCities={selectedCities}
            onCityToggle={handleCityToggle}
            maxSelections={5}
          />

          <ParameterFilter
            selectedParameters={selectedParameters}
            onParameterToggle={handleParameterToggle}
          />

          <TimeRangeSelector
            selectedRange={timeRange}
            onRangeChange={setTimeRange}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomDateChange={handleCustomDateChange}
          />

          <div className="bg-card border border-border rounded-lg p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0">
                {views?.map(view => (
                  <button
                    key={view?.id}
                    onClick={() => setActiveView(view?.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-250 flex-shrink-0 ${
                      activeView === view?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon name={view?.icon} size={16} />
                    <span>{view?.label}</span>
                  </button>
                ))}
              </div>

              {activeView === 'chart' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChartType('line')}
                    className={`p-2 rounded-lg transition-all duration-250 ${
                      chartType === 'line' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon name="TrendingUp" size={18} />
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`p-2 rounded-lg transition-all duration-250 ${
                      chartType === 'bar' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon name="BarChart3" size={18} />
                  </button>
                </div>
              )}
            </div>

            {activeView === 'chart' && (
              <ComparativeChart
                selectedCities={selectedCities}
                selectedParameters={selectedParameters}
                timeRange={timeRange}
                chartType={chartType}
              />
            )}

            {activeView === 'table' && (
              <DataTable
                selectedCities={selectedCities}
                selectedParameters={selectedParameters}
                timeRange={timeRange}
              />
            )}

            {activeView === 'statistics' && (
              <StatisticalView
                selectedCities={selectedCities}
                selectedParameters={selectedParameters}
              />
            )}

            {activeView === 'correlation' && (
              <CorrelationAnalysis
                selectedCities={selectedCities}
                selectedParameters={selectedParameters}
              />
            )}
          </div>

          <ExportControls
            selectedCities={selectedCities}
            selectedParameters={selectedParameters}
            timeRange={timeRange}
          />

          <div className="bg-card border border-border rounded-lg p-4 md:p-6">
            <div className="flex items-start gap-3">
              <Icon name="Lightbulb" size={20} color="var(--color-primary)" className="mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
                  Analysis Tips
                </h3>
                <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0 text-success" />
                    <span>Select 2-3 cities for clearer comparative insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0 text-success" />
                    <span>Use correlation analysis to identify relationships between parameters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0 text-success" />
                    <span>Export data for detailed offline analysis and reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0 text-success" />
                    <span>Compare longer time ranges (30-90 days) for trend identification</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Wind" size={20} color="var(--color-primary)" />
              <span className="text-sm font-medium text-foreground">EchoWatch</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              &copy; {new Date()?.getFullYear()} EchoWatch. Environmental monitoring for Rajasthan.
            </p>
            <div className="flex items-center gap-4">
              <button className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </button>
              <button className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </button>
              <button className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComparativeAnalysis;