import React, { useState } from 'react';
import ReportBuilder from './components/ReportBuilder';
import TrendChart from './components/TrendChart';
import StatisticsPanel from './components/StatisticsPanel';
import ReportTemplates from './components/ReportTemplates';
import ReportHistory from './components/ReportHistory';
import ComparisonTool from './components/ComparisonTool';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const HistoricalReports = () => {
  const [activeTab, setActiveTab] = useState('builder');

  const aqiTrendData = [
    { date: '12/01', value: 85 },
    { date: '12/08', value: 92 },
    { date: '12/15', value: 78 },
    { date: '12/22', value: 105 },
    { date: '12/29', value: 88 },
    { date: '01/05', value: 95 }
  ];

  const noiseTrendData = [
    { date: '12/01', value: 68 },
    { date: '12/08', value: 72 },
    { date: '12/15', value: 65 },
    { date: '12/22', value: 75 },
    { date: '12/29', value: 70 },
    { date: '01/05', value: 73 }
  ];

  const temperatureTrendData = [
    { date: '12/01', value: 62 },
    { date: '12/08', value: 58 },
    { date: '12/15', value: 55 },
    { date: '12/22', value: 52 },
    { date: '12/29', value: 48 },
    { date: '01/05', value: 50 }
  ];

  const humidityTrendData = [
    { date: '12/01', value: 65 },
    { date: '12/08', value: 68 },
    { date: '12/15', value: 72 },
    { date: '12/22', value: 70 },
    { date: '12/29', value: 75 },
    { date: '01/05', value: 73 }
  ];

  const statistics = {
    avgAqi: 89,
    aqiTrend: 5.2,
    peakNoise: 88,
    noiseTrend: -2.1,
    avgTemp: 55,
    tempTrend: -8.5,
    avgHumidity: 70,
    humidityTrend: 3.8
  };

  const tabs = [
    { id: 'builder', label: 'Report Builder', icon: 'FileText' },
    { id: 'templates', label: 'Templates', icon: 'LayoutTemplate' },
    { id: 'trends', label: 'Trends', icon: 'TrendingUp' },
    { id: 'statistics', label: 'Statistics', icon: 'BarChart3' },
    { id: 'comparison', label: 'Comparison', icon: 'GitCompare' },
    { id: 'history', label: 'History', icon: 'History' }
  ];

  const handleRefreshData = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  const handleGenerateReport = (config) => {
    console.log('Generating report with config:', config);
    setAlerts([{
      id: Date.now(),
      severity: 'info',
      title: 'Report Generation Started',
      message: 'Your report is being generated. This may take a few moments.',
      location: 'Report Builder'
    }]);
  };

  const handleSelectTemplate = (template) => {
    console.log('Selected template:', template);
    setActiveTab('builder');
  };

  const handleDownloadReport = (reportId) => {
    console.log('Downloading report:', reportId);
  };

  const handleShareReport = (reportId) => {
    console.log('Sharing report:', reportId);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="FileText" size={22} color="var(--color-primary)" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Historical Reports</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">Generate comprehensive reports for compliance and planning</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-2">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth flex-shrink-0
              ${activeTab === tab?.id 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            <Icon name={tab?.icon} size={16} color={activeTab === tab?.id ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)'} />
            <span className="whitespace-nowrap">{tab?.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6 md:space-y-8">
        {activeTab === 'builder' && (
          <ReportBuilder onGenerateReport={handleGenerateReport} />
        )}

        {activeTab === 'templates' && (
          <ReportTemplates onSelectTemplate={handleSelectTemplate} />
        )}

        {activeTab === 'trends' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <TrendChart title="Air Quality Trends" data={aqiTrendData} parameter="aqi" chartType="area" />
            <TrendChart title="Noise Level Trends" data={noiseTrendData} parameter="noise" chartType="line" />
            <TrendChart title="Temperature Trends" data={temperatureTrendData} parameter="temperature" chartType="area" />
            <TrendChart title="Humidity Trends" data={humidityTrendData} parameter="humidity" chartType="line" />
          </div>
        )}

        {activeTab === 'statistics' && (
          <StatisticsPanel statistics={statistics} />
        )}

        {activeTab === 'comparison' && (
          <ComparisonTool />
        )}

        {activeTab === 'history' && (
          <ReportHistory onDownloadReport={handleDownloadReport} onShareReport={handleShareReport} />
        )}
      </div>

      <div className="bg-card rounded-lg border border-border p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon name="Info" size={20} color={"var(--color-accent)"} />
            <div>
              <p className="text-sm font-medium text-foreground">Need Help?</p>
              <p className="text-sm text-muted-foreground">Access documentation and support resources</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" iconName="Book" iconPosition="left">
              Documentation
            </Button>
            <Button variant="outline" iconName="HelpCircle" iconPosition="left">
              Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalReports;