import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import AlertBanner from '../components/navigation/AlertBanner';
import DataRefreshIndicator from '../components/navigation/DataRefreshIndicator';
import UserRoleBadge from '../components/navigation/UserRoleBadge';
import { useAuth } from '../auth/AuthProvider';
import { useMyProfile } from '../utils/profileHooks';

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date()?.toISOString());
  const { user } = useAuth();
  const { profile } = useMyProfile(user);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleDismissAlert = (alertId) => {
    setAlerts(alerts?.filter(alert => alert?.id !== alertId));
  };

  const handleRefreshData = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setLastUpdate(new Date().toISOString());
        resolve();
      }, 1000);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AlertBanner 
        alerts={alerts}
        onDismiss={handleDismissAlert}
      />

      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <div 
        className={`
          transition-all duration-250 ease-smooth
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}
          pb-16 lg:pb-0
        `}
      >
        <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-foreground hidden md:block">
                Environmental Monitoring
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <DataRefreshIndicator
                lastUpdate={lastUpdate}
                isLive={true}
                onRefresh={handleRefreshData}
              />
              <UserRoleBadge
                role={profile?.role || 'viewer'}
                userName={profile?.full_name || user?.email || 'User'}
                showName={true}
              />
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;