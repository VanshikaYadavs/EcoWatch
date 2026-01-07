import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const DataRefreshIndicator = ({ 
  lastUpdate = null, 
  isLive = false, 
  onRefresh,
  autoRefreshInterval = 30000
}) => {
  const [timeAgo, setTimeAgo] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastUpdate) {
        setTimeAgo('Never');
        return;
      }

      const now = new Date();
      const updateTime = new Date(lastUpdate);
      const diffMs = now - updateTime;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);

      if (diffSec < 60) {
        setTimeAgo(`${diffSec}s ago`);
      } else if (diffMin < 60) {
        setTimeAgo(`${diffMin}m ago`);
      } else {
        setTimeAgo(`${diffHour}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  useEffect(() => {
    if (!isLive || !onRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [isLive, onRefresh, autoRefreshInterval]);

  const handleRefresh = async () => {
    if (isRefreshing || !onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`refresh-indicator ${isLive ? 'live' : ''}`}>
        {isLive && <span className="refresh-indicator-pulse" />}
        <span className="caption">
          {isLive ? 'Live' : 'Updated'} {timeAgo}
        </span>
      </div>

      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="touch-target p-2 rounded-lg bg-muted hover:bg-muted/80 transition-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Refresh data"
        title="Refresh environmental data"
      >
        <Icon 
          name="RefreshCw" 
          size={16}
          className={isRefreshing ? 'animate-spin' : ''}
          color="var(--color-muted-foreground)"
        />
      </button>
    </div>
  );
};

export default DataRefreshIndicator;