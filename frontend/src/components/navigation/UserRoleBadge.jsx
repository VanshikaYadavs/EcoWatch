import React from 'react';
import Icon from '../AppIcon';

const UserRoleBadge = ({ 
  role = 'viewer',
  userName = 'User',
  showName = true
}) => {
  const roleConfig = {
    admin: {
      label: 'Administrator',
      icon: 'Shield',
      description: 'Full system access'
    },
    researcher: {
      label: 'Researcher',
      icon: 'FlaskConical',
      description: 'Research data access'
    },
    official: {
      label: 'Government Official',
      icon: 'Building',
      description: 'Policy and decision-making access'
    },
    leader: {
      label: 'Community Leader',
      icon: 'Users',
      description: 'Public communication access'
    },
    health: {
      label: 'Health Official',
      icon: 'Heart',
      description: 'Health data and alerts access'
    },
    responder: {
      label: 'Emergency Responder',
      icon: 'Siren',
      description: 'Emergency response access'
    },
    analyst: {
      label: 'Data Analyst',
      icon: 'BarChart3',
      description: 'Analytics and reporting access'
    },
    viewer: {
      label: 'Viewer',
      icon: 'Eye',
      description: 'Read-only access'
    }
  };

  const config = roleConfig?.[role] || roleConfig?.viewer;

  return (
    <div className="flex items-center gap-3">
      {showName && (
        <span className="text-sm font-medium text-foreground hidden md:inline">
          {userName}
        </span>
      )}
      <div 
        className="role-badge"
        title={config?.description}
        role="status"
        aria-label={`User role: ${config?.label}`}
      >
        <Icon 
          name={config?.icon} 
          size={14}
          color="var(--color-primary)"
        />
        <span className="hidden sm:inline">{config?.label}</span>
        <span className="sm:hidden">{role?.charAt(0)?.toUpperCase()}</span>
      </div>
    </div>
  );
};

export default UserRoleBadge;