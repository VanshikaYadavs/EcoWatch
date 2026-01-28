import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import Chatbot from '../../components/Chatbot';
import EnvironmentalMetricCard from './components/EnvironmentalMetricCard';
import CityEnvironmentCard from './components/CityEnvironmentCard';
import InteractiveMap from './components/InteractiveMap';
import AlertCard from './components/AlertCard';
import ParameterFilterChip from './components/ParameterFilterChip';
import QuickStatsPanel from './components/QuickStatsPanel';
import { useTranslation } from 'react-i18next';

const EnvironmentalDashboard = () => {
  const navigate = useNavigate();
  const metricsScrollRef = useRef(null);
  const citiesScrollRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const { t } = useTranslation();

  const currentMetrics = [
  {
    id: 1,
    title: t('metrics.aqi.title'),
    value: 156,
    unit: "AQI",
    status: "moderate",
    trend: "up",
    icon: "Wind",
    description: t('metrics.aqi.desc')
  },
  {
    id: 2,
    title: t('metrics.noise.title'),
    value: 72,
    unit: "dB",
    status: "moderate",
    trend: "stable",
    icon: "Volume2",
    description: t('metrics.noise.desc')
  },
  {
    id: 3,
    title: t('metrics.temperature.title'),
    value: 34,
    unit: "°C",
    status: "good",
    trend: "up",
    icon: "Thermometer",
    description: t('metrics.temperature.desc')
  },
  {
    id: 4,
    title: t('metrics.humidity.title'),
    value: 45,
    unit: "%",
    status: "good",
    trend: "down",
    icon: "Droplets",
    description: t('metrics.humidity.desc')
  },
  {
    id: 5,
    title: t('metrics.pm25.title'),
    value: 89,
    unit: "µg/m³",
    status: "moderate",
    trend: "up",
    icon: "Cloud",
    description: t('metrics.pm25.desc')
  },
  {
    id: 6,
    title: t('metrics.uv.title'),
    value: 8,
    unit: "UV",
    status: "unhealthy",
    trend: "up",
    icon: "Sun",
    description: t('metrics.uv.desc')
  }];


  const cityData = [
  {
    id: 1,
    cityName: "Jaipur",
    region: "Central",
    image: "https://images.unsplash.com/photo-1619663157564-ef32b3dfe257",
    imageAlt: "Aerial view of Jaipur city showing pink sandstone buildings and Hawa Mahal palace with clear blue sky",
    aqi: 156,
    temperature: 34,
    humidity: 45,
    noiseLevel: 72,
    status: "moderate"
  },
  {
    id: 2,
    cityName: "Udaipur",
    region: "Southern",
    image: "https://images.unsplash.com/photo-1723873987779-3911cd5039c2",
    imageAlt: "Scenic view of Udaipur City Palace overlooking Lake Pichola with white marble architecture and surrounding hills",
    aqi: 98,
    temperature: 32,
    humidity: 52,
    noiseLevel: 65,
    status: "good"
  },
  {
    id: 3,
    cityName: "Jodhpur",
    region: "Western",
    image: "https://images.unsplash.com/photo-1698146009786-301cbdc9eeda",
    imageAlt: "Panoramic view of Jodhpur blue city with Mehrangarh Fort on hilltop and traditional blue painted houses below",
    aqi: 142,
    temperature: 36,
    humidity: 38,
    noiseLevel: 68,
    status: "moderate"
  },
  {
    id: 4,
    cityName: "Ajmer",
    region: "Central",
    image: "https://images.unsplash.com/photo-1687241885959-a2969cda4e6f",
    imageAlt: "View of Ajmer Sharif Dargah with white marble domes and minarets surrounded by Aravalli hills",
    aqi: 134,
    temperature: 33,
    humidity: 48,
    noiseLevel: 70,
    status: "moderate"
  },
  {
    id: 5,
    cityName: "Tonk",
    region: "Eastern",
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a0d261bd-1766896152808.png",
    imageAlt: "Traditional Rajasthani architecture in Tonk showing ornate haveli with carved balconies and colorful facades",
    aqi: 128,
    temperature: 35,
    humidity: 42,
    noiseLevel: 66,
    status: "moderate"
  },
  {
    id: 6,
    cityName: "Bikaner",
    region: "Northern",
    image: "https://images.unsplash.com/photo-1669410611532-9795dbcba3ff",
    imageAlt: "Junagarh Fort in Bikaner with red sandstone walls and intricate Rajput architecture against desert landscape",
    aqi: 165,
    temperature: 38,
    humidity: 35,
    noiseLevel: 64,
    status: "unhealthy"
  }];


  const hotspots = [
  {
    id: 1,
    location: t('locations.miRoad'),
    severity: "high",
    type: "AQI",
    value: "198 AQI"
  },
  {
    id: 2,
    location: t('locations.clockTower'),
    severity: "medium",
    type: "Noise",
    value: "85 dB"
  },
  {
    id: 3,
    location: t('locations.lakePichola'),
    severity: "low",
    type: "Temperature",
    value: "31°C"
  },
  {
    id: 4,
    location: t('locations.pushkarRoad'),
    severity: "high",
    type: "PM2.5",
    value: "156 µg/m³"
  },
  {
    id: 5,
    location: t('locations.industrialTonk'),
    severity: "medium",
    type: "AQI",
    value: "145 AQI"
  }];


  const recentAlerts = [
  {
    id: 1,
    title: t('alerts.highAqi'),
    location: t('locations.miRoad'),
    severity: "critical",
    timestamp: new Date(Date.now() - 15 * 60000),
    parameter: "Air Quality Index",
    value: "198 AQI",
    threshold: "150 AQI"
  },
  {
    id: 2,
    title: t('alerts.elevatedNoise'),
    location: t('locations.clockTower'),
    severity: "high",
    timestamp: new Date(Date.now() - 45 * 60000),
    parameter: "Noise Level",
    value: "85 dB",
    threshold: "75 dB"
  },
  {
    id: 3,
    title: t('alerts.pm25Exceeded'),
    location: t('locations.pushkarRoad'),
    severity: "critical",
    timestamp: new Date(Date.now() - 90 * 60000),
    parameter: "PM2.5 Concentration",
    value: "156 µg/m³",
    threshold: "100 µg/m³"
  },
  {
    id: 4,
    title: t('alerts.temperatureAlert'),
    location: t('locations.bikanerIndustrial'),
    severity: "medium",
    timestamp: new Date(Date.now() - 120 * 60000),
    parameter: "Temperature",
    value: "42°C",
    threshold: "40°C"
  }];


  const filterOptions = [
  { id: 'all', label: t('filters.all'), icon: 'LayoutGrid', count: 6 },
  { id: 'aqi', label: t('filters.aqi'), icon: 'Wind', count: 2 },
  { id: 'noise', label: t('filters.noise'), icon: 'Volume2', count: 1 },
  { id: 'temperature', label: t('filters.temperature'), icon: 'Thermometer', count: 1 },
  { id: 'humidity', label: t('filters.humidity'), icon: 'Droplets', count: 1 },
  { id: 'pm25', label: t('filters.pm25'), icon: 'Cloud', count: 1 }];


  const quickStats = [
  {
    label: t('stats.citiesMonitored'),
    value: "10",
    icon: "MapPin",
    color: "var(--color-primary)",
    bgColor: "bg-primary/10"
  },
  {
    label: t('stats.activeAlerts'),
    value: "24",
    icon: "Bell",
    color: "var(--color-error)",
    bgColor: "bg-error/10",
    change: t('stats.alertsChange', { percent: '12%' }),
    changeType: "negative"
  },
  {
    label: t('stats.avgAqi'),
    value: "142",
    icon: "TrendingUp",
    color: "var(--color-warning)",
    bgColor: "bg-warning/10",
    change: t('stats.aqiImprovement', { percent: '8%' }),
    changeType: "positive"
  },
  {
    label: t('stats.hotspots'),
    value: "5",
    icon: "AlertTriangle",
    color: "var(--color-accent)",
    bgColor: "bg-accent/10"
  }];


  const scroll = (ref, direction) => {
    if (ref?.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      ref?.current?.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCityClick = (cityId) => {
    console.log('City clicked:', cityId);
  };

  const handleAlertClick = (alertId) => {
    console.log('Alert clicked:', alertId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-6 md:mb-8 lg:mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                  {t('page.title')}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('page.subtitle')} • {t('page.updatedAt', { time: new Date()?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) })}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  iconName="BarChart3"
                  iconPosition="left"
                  onClick={() => navigate('/comparative-analysis')}>

                  {t('buttons.compareCities')}
                </Button>
                <Button
                  variant="default"
                  iconName="LogIn"
                  iconPosition="left"
                  onClick={() => navigate('/login')}>

                  {t('buttons.signInAlerts')}
                </Button>
              </div>
            </div>

            <div className="relative">
              <Icon
                name="Search"
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />

              <Input
                type="search"
                placeholder={t('placeholders.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="pl-12 pr-4 py-3 md:py-4 text-base" />

            </div>
          </div>

          <div className="mb-8 md:mb-10 lg:mb-12">
            <QuickStatsPanel stats={quickStats} />
          </div>

          <div className="mb-8 md:mb-10 lg:mb-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                {t('sections.filterBy')}
              </h2>
            </div>
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scroll-padding-top smooth-scroll">
              {filterOptions?.map((filter) =>
              <ParameterFilterChip
                key={filter?.id}
                label={filter?.label}
                icon={filter?.icon}
                count={filter?.count}
                isActive={activeFilter === filter?.id}
                onClick={() => setActiveFilter(filter?.id)} />

              )}
            </div>
          </div>

          <div className="mb-8 md:mb-10 lg:mb-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                {t('sections.currentMetrics')}
              </h2>
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => scroll(metricsScrollRef, 'left')}
                  className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition-all duration-250">

                  <Icon name="ChevronLeft" size={20} />
                </button>
                <button
                  onClick={() => scroll(metricsScrollRef, 'right')}
                  className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition-all duration-250">

                  <Icon name="ChevronRight" size={20} />
                </button>
              </div>
            </div>
            <div
              ref={metricsScrollRef}
              className="flex gap-4 md:gap-5 lg:gap-6 overflow-x-auto pb-4 scroll-padding-top smooth-scroll">

              {currentMetrics?.map((metric) =>
              <EnvironmentalMetricCard
                key={metric?.id}
                {...metric} />

              )}
            </div>
          </div>

          <div className="mb-8 md:mb-10 lg:mb-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                {t('sections.cityData')}
              </h2>
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => scroll(citiesScrollRef, 'left')}
                  className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition-all duration-250">

                  <Icon name="ChevronLeft" size={20} />
                </button>
                <button
                  onClick={() => scroll(citiesScrollRef, 'right')}
                  className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition-all duration-250">

                  <Icon name="ChevronRight" size={20} />
                </button>
              </div>
            </div>
            <div
              ref={citiesScrollRef}
              className="flex gap-4 md:gap-5 lg:gap-6 overflow-x-auto pb-4 scroll-padding-top smooth-scroll">

              {cityData?.map((city) =>
              <CityEnvironmentCard
                key={city?.id}
                {...city}
                onClick={() => handleCityClick(city?.id)} />

              )}
            </div>
          </div>

          <div className="mb-8 md:mb-10 lg:mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                {t('sections.hotspotsMap')}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="MapPin" size={16} />
                <span>{t('sections.clickMarkers')}</span>
              </div>
            </div>
            <InteractiveMap hotspots={hotspots} />
          </div>

          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                {t('sections.recentAlerts')}
              </h2>
              <Button
                variant="outline"
                size="sm"
                iconName="Bell"
                iconPosition="left"
                onClick={() => navigate('/login')}>

                {t('buttons.signInManage')}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
              {recentAlerts?.map((alert) =>
              <AlertCard
                key={alert?.id}
                {...alert}
                onClick={() => handleAlertClick(alert?.id)} />

              )}
            </div>
          </div>

          <div className="mt-12 md:mt-16 lg:mt-20 p-6 md:p-8 lg:p-10 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-primary/20">
                <Icon name="Bell" size={32} color="var(--color-primary)" className="md:w-10 md:h-10" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">
                {t('cta.title')}
              </h3>
              <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
                {t('cta.description')}
              </p>
              <Button
                variant="default"
                size="lg"
                iconName="LogIn"
                iconPosition="left"
                onClick={() => navigate('/login')}>

                {t('buttons.createAccount')}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-border bg-card">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
                <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Icon name="Wind" size={24} color="var(--color-primary)" />
                </div>
                <span className="text-xl font-heading font-semibold text-foreground">{t('brand.name')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('brand.tagline')}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.quickLinks')}</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigate('/environmental-dashboard')} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {t('footer.links.dashboard')}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/comparative-analysis')} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {t('footer.links.compare')}
                  </button>
                </li>
                <li>
 param($m) $text = $m.Value; if ($text -match '=======(.*?)>>>>>>>') { $matches[1].Trim() + "`n" } else { '' } translation
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.resources.title')}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.resources.about')}</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.resources.health')}</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.resources.data')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.contact.title')}</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Mail" size={16} />
                  <span>info@echowatch.in</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Phone" size={16} />
                  <span>+91 141 2345678</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date()?.getFullYear()} {t('brand.name')}. {t('footer.rights')} | {t('footer.monitoring')}
            </p>
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>);

};

export default EnvironmentalDashboard;
