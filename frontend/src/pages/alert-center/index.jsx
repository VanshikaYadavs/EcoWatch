import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import AlertsList from './components/AlertsList';
import AlertFilters from './components/AlertFilters';
import AlertStatistics from './components/AlertStatistics';
import AlertDetailsModal from './components/AlertDetailsModal';
import { useAlertEvents } from '../../utils/dataHooks';
import Icon from '../../components/AppIcon';

const AlertCenter = () => {
  const [filters, setFilters] = useState({
    severity: 'all', // all, critical, high, medium, low
    status: 'all', // all, active, resolved, acknowledged
    type: 'all', // all, aqi, temperature, noise, water
    location: 'all',
    dateRange: '7days' // 7days, 30days, 90days, all
  });

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');

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
    // TODO: Implement API call to acknowledge alert
  };

  const handleResolveAlert = (alertId) => {
    console.log('Resolving alert:', alertId);
    // TODO: Implement API call to resolve alert
  };

  const handleDeleteAlert = (alertId) => {
    console.log('Deleting alert:', alertId);
    // TODO: Implement API call to delete alert
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
        <meta name="description" content="Manage and monitor environmental alerts in real-time with comprehensive filtering, severity levels, and alert history." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Icon name="Bell" size={32} />
                  Alert Center
                </h1>
                <p className="text-muted-foreground mt-1">Monitor and manage environmental alerts</p>
              </div>
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics */}
          <AlertStatistics alerts={sortedAlerts} loading={loading} />

          {/* Filters */}
          <AlertFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            alertCount={sortedAlerts.length}
          />

          {/* Alerts List */}
          <AlertsList
            alerts={sortedAlerts}
            loading={loading}
            onSelectAlert={setSelectedAlert}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            onDelete={handleDeleteAlert}
          />
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
