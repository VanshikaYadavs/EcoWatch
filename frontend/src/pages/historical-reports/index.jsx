import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReportBuilder from './components/ReportBuilder';
import TrendChart from './components/TrendChart';
import StatisticsPanel from './components/StatisticsPanel';
import ReportTemplates from './components/ReportTemplates';
import ReportHistory from './components/ReportHistory';
import ComparisonTool from './components/ComparisonTool';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import AutoText from '../../components/ui/AutoText';
import { useEnvironmentReadings } from '../../utils/dataHooks';

const HistoricalReports = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('builder');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');

  const now = useMemo(() => new Date(), []);
  const { start, end } = useMemo(() => {
    const end = now.toISOString();
    const d = new Date(now);
    if (timeRange === '7d') d.setDate(d.getDate() - 7);
    else if (timeRange === '30d') d.setDate(d.getDate() - 30);
    else if (timeRange === '90d') d.setDate(d.getDate() - 90);
    else if (timeRange === '1y') d.setFullYear(d.getFullYear() - 1);
    else d.setDate(d.getDate() - 1);
    const start = d.toISOString();
    return { start, end };
  }, [now, timeRange]);

  const { data: readings, loading } = useEnvironmentReadings({ location: selectedLocation, limit: 2000, start, end });

  const byDay = useMemo(() => {
    const bucket = {};
    (readings || []).forEach(r => {
      const dt = new Date(r.recorded_at);
      const key = `${dt.getMonth()+1}/${dt.getDate()}`; // MM/DD
      bucket[key] = bucket[key] || { aqi: [], noise: [], temp: [], humidity: [] };
      if (typeof r.aqi === 'number') bucket[key].aqi.push(r.aqi);
      if (typeof r.noise_level === 'number') bucket[key].noise.push(r.noise_level);
      if (typeof r.temperature === 'number') bucket[key].temp.push(r.temperature);
      if (typeof r.humidity === 'number') bucket[key].humidity.push(r.humidity);
    });
    const avg = (arr) => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : null;
    const dates = Object.keys(bucket);
    dates.sort((a,b) => {
      const [am,ad] = a.split('/').map(Number);
      const [bm,bd] = b.split('/').map(Number);
      return am === bm ? ad - bd : am - bm;
    });
    return {
      aqi: dates.map(k => ({ date: k, value: avg(bucket[k].aqi) })).filter(p => p.value != null),
      noise: dates.map(k => ({ date: k, value: avg(bucket[k].noise) })).filter(p => p.value != null),
      temp: dates.map(k => ({ date: k, value: avg(bucket[k].temp) })).filter(p => p.value != null),
      humidity: dates.map(k => ({ date: k, value: avg(bucket[k].humidity) })).filter(p => p.value != null),
    };
  }, [readings]);

  const statistics = useMemo(() => {
    const vals = {
      aqi: (readings || []).map(r => r.aqi).filter(v => typeof v === 'number'),
      noise: (readings || []).map(r => r.noise_level).filter(v => typeof v === 'number'),
      temp: (readings || []).map(r => r.temperature).filter(v => typeof v === 'number'),
      humidity: (readings || []).map(r => r.humidity).filter(v => typeof v === 'number'),
    };
    const avg = (arr) => arr.length ? Math.round((arr.reduce((a,b)=>a+b,0)/arr.length) * 10)/10 : null;
    const trend = (arr) => (arr.length > 1 ? Math.round((arr[arr.length-1] - arr[0]) * 10)/10 : 0);
    return {
      avgAqi: avg(vals.aqi) ?? '--',
      aqiTrend: trend(vals.aqi) ?? 0,
      peakNoise: (vals.noise.length ? Math.max(...vals.noise) : '--'),
      noiseTrend: trend(vals.noise) ?? 0,
      avgTemp: avg(vals.temp) ?? '--',
      tempTrend: trend(vals.temp) ?? 0,
      avgHumidity: avg(vals.humidity) ?? '--',
      humidityTrend: trend(vals.humidity) ?? 0,
    };
  }, [readings]);

  const locationOptions = [
    { value: 'all', label: t('reports.locations.all') },
    { value: 'Jaipur', label: 'Jaipur' },
    { value: 'Tonk', label: 'Tonk' },
  ];
  const timeOptions = [
    { value: '7d', label: t('reports.time.7d') },
    { value: '30d', label: t('reports.time.30d') },
    { value: '90d', label: t('reports.time.90d') },
    { value: '1y', label: t('reports.time.1y') },
  ];

  const tabs = [
    { id: 'builder', label: t('reports.tabs.builder'), icon: 'FileText' },
    { id: 'templates', label: t('reports.tabs.templates'), icon: 'LayoutTemplate' },
    { id: 'trends', label: t('reports.tabs.trends'), icon: 'TrendingUp' },
    { id: 'statistics', label: t('reports.tabs.statistics'), icon: 'BarChart3' },
    { id: 'comparison', label: t('reports.tabs.comparison'), icon: 'GitCompare' },
    { id: 'history', label: t('reports.tabs.history'), icon: 'History' }
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
          <h1 className="text-xl md:text-2xl font-semibold text-foreground"><AutoText i18nKey="reports.title" defaultText="Historical Reports" /></h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground"><AutoText i18nKey="reports.subtitle" defaultText="Generate comprehensive reports for compliance and planning" /></p>
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
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Select options={locationOptions} value={selectedLocation} onChange={setSelectedLocation} placeholder={t('reports.placeholders.location')} />
              <Select options={timeOptions} value={timeRange} onChange={setTimeRange} placeholder={t('reports.placeholders.timeRange')} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <TrendChart title="Air Quality Trends" data={byDay.aqi} parameter="aqi" chartType="area" />
              <TrendChart title="Noise Level Trends" data={byDay.noise} parameter="noise" chartType="line" />
              <TrendChart title="Temperature Trends" data={byDay.temp} parameter="temperature" chartType="area" />
              <TrendChart title="Humidity Trends" data={byDay.humidity} parameter="humidity" chartType="line" />
            </div>
          </>
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
              <p className="text-sm font-medium text-foreground">{t('reports.needHelp.title')}</p>
              <p className="text-sm text-muted-foreground">{t('reports.needHelp.subtitle')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" iconName="Book" iconPosition="left">
              {t('reports.buttons.documentation')}
            </Button>
            <Button variant="outline" iconName="HelpCircle" iconPosition="left">
              {t('reports.buttons.support')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalReports;

