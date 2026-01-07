import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ReportHistory = ({ onDownloadReport, onShareReport }) => {
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const reportHistory = [
    {
      id: 'rpt-001',
      name: 'Monthly Compliance Report - December 2025',
      type: 'compliance',
      generatedDate: '01/05/2026',
      generatedBy: 'John Smith',
      format: 'PDF',
      size: '2.4 MB',
      status: 'completed',
      downloads: 12,
      shared: true
    },
    {
      id: 'rpt-002',
      name: 'Annual Environmental Assessment 2025',
      type: 'annual',
      generatedDate: '01/01/2026',
      generatedBy: 'Sarah Johnson',
      format: 'PDF',
      size: '8.7 MB',
      status: 'completed',
      downloads: 45,
      shared: true
    },
    {
      id: 'rpt-003',
      name: 'Incident Analysis - High AQI Event',
      type: 'incident',
      generatedDate: '12/28/2025',
      generatedBy: 'Michael Chen',
      format: 'Excel',
      size: '1.8 MB',
      status: 'completed',
      downloads: 8,
      shared: false
    },
    {
      id: 'rpt-004',
      name: 'Q4 2025 Trend Analysis',
      type: 'trend',
      generatedDate: '12/31/2025',
      generatedBy: 'Emily Davis',
      format: 'PDF',
      size: '3.2 MB',
      status: 'completed',
      downloads: 23,
      shared: true
    },
    {
      id: 'rpt-005',
      name: 'Weekly Public Summary - Week 52',
      type: 'public',
      generatedDate: '01/03/2026',
      generatedBy: 'David Wilson',
      format: 'PDF',
      size: '1.1 MB',
      status: 'completed',
      downloads: 156,
      shared: true
    },
    {
      id: 'rpt-006',
      name: 'Custom Analysis - MI Road, Jaipur',
      type: 'custom',
      generatedDate: '01/04/2026',
      generatedBy: 'John Smith',
      format: 'CSV',
      size: '0.9 MB',
      status: 'processing',
      downloads: 0,
      shared: false
    }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'annual', label: 'Annual' },
    { value: 'incident', label: 'Incident' },
    { value: 'trend', label: 'Trend' },
    { value: 'public', label: 'Public' },
    { value: 'custom', label: 'Custom' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date (Newest First)' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'downloads', label: 'Most Downloaded' },
    { value: 'size', label: 'File Size' }
  ];

  const getTypeIcon = (type) => {
    const icons = {
      compliance: 'FileCheck',
      annual: 'Calendar',
      incident: 'AlertTriangle',
      trend: 'TrendingUp',
      public: 'Users',
      custom: 'FileText'
    };
    return icons?.[type] || 'FileText';
  };

  const getTypeColor = (type) => {
    const colors = {
      compliance: '#059669',
      annual: '#3B82F6',
      incident: '#DC2626',
      trend: '#D97706',
      public: '#8B5CF6',
      custom: '#6B7280'
    };
    return colors?.[type] || '#6B7280';
  };

  const getStatusBadge = (status) => {
    if (status === 'processing') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-warning/10 text-warning">
          <Icon name="Loader2" size={12} className="animate-spin" />
          Processing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
        <Icon name="CheckCircle2" size={12} />
        Completed
      </span>
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="History" size={20} color="var(--color-primary)" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">Report History</h2>
            <p className="text-sm text-muted-foreground mt-1">Previously generated reports</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            options={typeOptions}
            value={filterType}
            onChange={setFilterType}
            placeholder="Filter by type"
            className="sm:w-48"
          />
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort by"
            className="sm:w-48"
          />
        </div>
      </div>
      <div className="space-y-4">
        {reportHistory?.map((report) => (
          <div key={report?.id} className="bg-muted rounded-lg p-4 md:p-6 transition-smooth hover:shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${getTypeColor(report?.type)}20` }}>
                  <Icon name={getTypeIcon(report?.type)} size={20} color={getTypeColor(report?.type)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-foreground line-clamp-1">{report?.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      {report?.generatedDate}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Icon name="User" size={14} />
                      {report?.generatedBy}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Icon name="FileType" size={14} />
                      {report?.format}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Icon name="HardDrive" size={14} />
                      {report?.size}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Icon name="Download" size={14} />
                      {report?.downloads} downloads
                    </span>
                  </div>
                  <div className="mt-2">
                    {getStatusBadge(report?.status)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  iconPosition="left"
                  onClick={() => onDownloadReport(report?.id)}
                  disabled={report?.status === 'processing'}
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Share2"
                  iconPosition="left"
                  onClick={() => onShareReport(report?.id)}
                  disabled={report?.status === 'processing'}
                >
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="MoreVertical"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportHistory;