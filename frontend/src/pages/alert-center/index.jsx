import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import AlertsList from './components/AlertsList';
import AlertFilters from './components/AlertFilters';
import AlertStatistics from './components/AlertStatistics';
import AlertDetailsModal from './components/AlertDetailsModal';
import AlertTimeline from './components/AlertTimeline';
import { useAlertEvents } from '../../utils/dataHooks';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AlertCenter = () => {
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    type: 'all',
    location: 'all',
    dateRange: '7days'
  });

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list, timeline, grid
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);

  const { data: allAlerts = [], loading } = useAlertEvents({ limit: 500 });

  // Filter and sort alerts
  const filteredAlerts = allAlerts.filter(alert => {
    if (filters.severity !== 'all' && alert.severity !== filters.severity) return false;
    if (filters.status !== 'all' && alert.status !== filters.status) return false;
    if (filters.type !== 'all' && alert.type !== filters.type) return false;
    if (filters.location !== 'all' && alert.location !== filters.location) return false;
    if (searchTerm && !alert.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === 'severity') {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    }
    return 0;
  });

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      severity: 'all',
      status: 'all',
      type: 'all',
      location: 'all',
      dateRange: '7days'
    });
    setSearchTerm('');
  };

  const handleAcknowledgeAlert = (alertId) => {
    console.log('Acknowledging alert:', alertId);
    // TODO: Implement API call
  };

  const handleResolveAlert = (alertId) => {
    console.log('Resolving alert:', alertId);
    // TODO: Implement API call
  };

  const handleDeleteAlert = (alertId) => {
    console.log('Deleting alert:', alertId);
    // TODO: Implement API call
  };

  const handleExportAlerts = () => {
    const csvContent = [
      ['Timestamp', 'Severity', 'Type', 'Location', 'Title', 'Status'],
      ...sortedAlerts.map(a => [
        new Date(a.created_at).toLocaleString(),
        a.severity,
        a.type,
        a.location,
        a.title,
        a.status
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <>
      <Helmet>
        <title>Alert Center - EchoWatch</title>
        <meta name="description" content="Comprehensive alert management and monitoring system with real-time notifications, filtering, and history tracking." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Header */}
        <div className="border-b border-border bg-gradient-to-r from-card to-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Icon name="Bell" size={32} className="text-red-700" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Alert Center</h1>
                    <p className="text-sm text-muted-foreground mt-1">Monitor and manage environmental alerts in real-time</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className="px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2 text-sm"
                >
                  <Icon name="Sliders" size={16} />
                  {showFiltersPanel ? 'Hide' : 'Show'} Filters
                </button>
                <button
                  onClick={handleExportAlerts}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Icon name="Download" size={18} />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          <AlertStatistics alerts={sortedAlerts} loading={loading} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
            {/* Filters Panel */}
            {showFiltersPanel && (
              <div className="lg:col-span-1">
                <AlertFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  alertCount={sortedAlerts.length}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            )}

            {/* Main Content */}
            <div className={showFiltersPanel ? 'lg:col-span-3' : 'lg:col-span-4'}>
              {/* View Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">View:</span>
                  <div className="flex gap-2 bg-card border border-border rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'list'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="List view"
                    >
                      <Icon name="List" size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('timeline')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'timeline'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Timeline view"
                    >
                      <Icon name="Clock" size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Grid view"
                    >
                      <Icon name="Grid" size={18} />
                    </button>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {sortedAlerts.length} alert{sortedAlerts.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Content Based on View Mode */}
              {viewMode === 'list' && (
                <AlertsList
                  alerts={sortedAlerts}
                  loading={loading}
                  onSelectAlert={setSelectedAlert}
                  onAcknowledge={handleAcknowledgeAlert}
                  onResolve={handleResolveAlert}
                  onDelete={handleDeleteAlert}
                />
              )}

              {viewMode === 'timeline' && (
                <AlertTimeline
                  alerts={sortedAlerts}
                  loading={loading}
                  onSelectAlert={setSelectedAlert}
                />
              )}

              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedAlerts.map(alert => (
                    <div
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.severity?.toUpperCase()}
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{alert.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{alert.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{alert.location}</span>
                        <span className={`px-2 py-1 rounded ${
                          alert.status === 'active' ? 'bg-red-50 text-red-700' :
                          alert.status === 'acknowledged' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-green-50 text-green-700'
                        }`}>
                          {alert.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <AlertDetailsModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={handleAcknowledgeAlert}
          onResolve={handleResolveAlert}
          onDelete={handleDeleteAlert}
        />
      )}
    </>
  );
};

export default AlertCenter;
