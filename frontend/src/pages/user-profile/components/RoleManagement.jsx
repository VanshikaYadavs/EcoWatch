import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RoleManagement = ({ profileData }) => {
  const roleConfig = {
    admin: {
      label: 'Administrator',
      icon: 'Shield',
      description: 'Full system access with administrative privileges',
      color: 'var(--color-error)'
    },
    official: {
      label: 'Government Official',
      icon: 'Building',
      description: 'Policy and decision-making access',
      color: 'var(--color-primary)'
    },
    leader: {
      label: 'Community Leader',
      icon: 'Users',
      description: 'Public communication and community engagement access',
      color: 'var(--color-success)'
    },
    health: {
      label: 'Health Official',
      icon: 'Heart',
      description: 'Health data and public health alerts access',
      color: 'var(--color-warning)'
    },
    analyst: {
      label: 'Data Analyst',
      icon: 'BarChart3',
      description: 'Analytics, reporting, and data visualization access',
      color: 'var(--color-secondary)'
    },
    researcher: {
      label: 'Researcher',
      icon: 'FlaskConical',
      description: 'Research data and historical analysis access',
      color: 'var(--color-primary)'
    }
  };

  const currentRole = roleConfig?.[profileData?.role] || roleConfig?.official;

  const permissionDescriptions = {
    view_all_data: 'View all environmental monitoring data',
    generate_reports: 'Generate and export reports',
    configure_alerts: 'Configure alert thresholds and notifications',
    export_data: 'Export data in various formats',
    manage_users: 'Manage user accounts and permissions',
    system_config: 'Configure system settings'
  };

  const handleRequestUpgrade = () => {
    console.log('Requesting role upgrade');
    // In real implementation, this would submit a request to administrators
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Current Role */}
      <div className="bg-muted rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-card rounded-lg">
              <Icon name={currentRole?.icon} size={32} color={currentRole?.color} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">
                {currentRole?.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentRole?.description}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            iconName="ArrowUpCircle"
            iconPosition="left"
            onClick={handleRequestUpgrade}
          >
            Request Upgrade
          </Button>
        </div>
      </div>

      {/* Permissions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Key" size={20} color="var(--color-primary)" />
          Current Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {profileData?.permissions?.map((permission) => (
            <div
              key={permission}
              className="flex items-center gap-3 p-3 bg-muted rounded-lg"
            >
              <div className="p-2 bg-success/10 rounded-md">
                <Icon name="CheckCircle" size={16} color="var(--color-success)" />
              </div>
              <span className="text-sm text-foreground">
                {permissionDescriptions?.[permission] || permission}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Available Roles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Users" size={20} color="var(--color-primary)" />
          Available Roles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(roleConfig)?.map(([roleKey, role]) => (
            <div
              key={roleKey}
              className={`p-4 rounded-lg border-2 transition-all ${
                profileData?.role === roleKey
                  ? 'border-primary bg-primary/5' :'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon name={role?.icon} size={24} color={role?.color} />
                <h4 className="font-semibold text-foreground">{role?.label}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{role?.description}</p>
              {profileData?.role === roleKey && (
                <div className="mt-3 flex items-center gap-2 text-sm text-primary font-medium">
                  <Icon name="CheckCircle" size={16} />
                  Current Role
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3">
        <Icon name="AlertTriangle" size={20} color="var(--color-warning)" className="mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground mb-1">Role Change Request</h4>
          <p className="text-sm text-muted-foreground">
            Role upgrades require administrator approval. Submit a request with justification for the role change, and you'll be notified once it's reviewed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;