import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/environmental-dashboard',
      icon: 'LayoutDashboard',
      description: 'Real-time environmental overview'
    },
    {
      label: 'Air Quality',
      path: '/air-quality-monitor',
      icon: 'Wind',
      description: 'AQI monitoring and analysis'
    },
    {
      label: 'Noise Monitoring',
      path: '/noise-level-tracking',
      icon: 'Volume2',
      description: 'Acoustic pollution tracking'
    },
    {
      label: 'Temperature',
      path: '/temperature-analytics',
      icon: 'Thermometer',
      description: 'Thermal analytics and trends'
    },
    {
      label: 'Reports',
      path: '/historical-reports',
      icon: 'FileText',
      description: 'Historical analysis and compliance'
    },
    {
      label: 'Notifications',
      path: '/notification-settings',
      icon: 'Bell',
      description: 'Alert preferences and settings'
    },
    {
      label: 'Profile',
      path: '/user-profile',
      icon: 'User',
      description: 'Account settings and preferences'
    }
  ];

  const isActive = (path) => location?.pathname === path;

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      <button
        onClick={handleMobileToggle}
        className="fixed top-4 left-4 z-[300] lg:hidden touch-target p-2 bg-card rounded-lg shadow-md transition-smooth hover:shadow-lg focus-ring"
        aria-label="Toggle mobile menu"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={24} color="var(--color-foreground)" />
      </button>
      <aside
        className={`
          fixed top-0 left-0 h-full bg-card border-r border-border z-[100]
          transition-all duration-250 ease-smooth
          ${isCollapsed ? 'w-20' : 'w-60'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'sidebar-collapsed' : ''}
        `}
      >
        <div className="sidebar-header">
          <div className="flex items-center">
            <div className="sidebar-logo">
              <Icon name="Waves" size={24} color="#FFFFFF" />
            </div>
            <span className="sidebar-logo-text">EchoWatch</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2 p-4 mt-4" role="navigation" aria-label="Main navigation">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`nav-item ${isActive(item?.path) ? 'active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? item?.description : ''}
              aria-current={isActive(item?.path) ? 'page' : undefined}
            >
              <Icon 
                name={item?.icon} 
                size={20} 
                className="nav-item-icon"
                color={isActive(item?.path) ? 'var(--color-primary-foreground)' : 'var(--color-foreground)'}
              />
              <span className="nav-item-label">{item?.label}</span>
            </Link>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="absolute bottom-8 left-4 right-4 p-4 bg-muted rounded-lg">
            <p className="caption text-muted-foreground text-center">
              Environmental Monitoring System
            </p>
            <p className="caption text-muted-foreground text-center mt-1">
              v2.1.0 • 2026
            </p>
          </div>
        )}
      </aside>
      <div
        className={`
          hidden lg:block fixed bottom-8 z-[100] transition-all duration-250
          ${isCollapsed ? 'left-6' : 'left-52'}
        `}
      >
        <button
          onClick={onToggleCollapse}
          className="touch-target p-2 bg-card rounded-lg shadow-md transition-smooth hover:shadow-lg focus-ring"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon 
            name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} 
            size={20} 
            color="var(--color-foreground)"
          />
        </button>
      </div>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background z-50 lg:hidden"
          onClick={handleMobileToggle}
          aria-hidden="true"
        />
      )}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden bg-card border-t border-border">
        <div className="flex justify-around items-center h-16 px-2">
          {navigationItems?.slice(0, 5)?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-smooth touch-target
                ${isActive(item?.path) ? 'text-primary' : 'text-muted-foreground'}
              `}
              aria-current={isActive(item?.path) ? 'page' : undefined}
            >
              <Icon 
                name={item?.icon} 
                size={20}
                color={isActive(item?.path) ? 'var(--color-primary)' : 'var(--color-muted-foreground)'}
              />
              <span className="caption text-[10px] mt-1">{item?.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;