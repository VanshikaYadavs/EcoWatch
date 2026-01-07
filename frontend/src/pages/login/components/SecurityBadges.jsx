import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      id: 1,
      icon: 'Shield',
      label: 'Government Certified',
      description: 'Approved by Environmental Protection Agency'
    },
    {
      id: 2,
      icon: 'Lock',
      label: 'Secure Authentication',
      description: 'Multi-factor authentication enabled'
    },
    {
      id: 3,
      icon: 'Database',
      label: 'Data Integrity',
      description: 'Real-time validation and verification'
    },
    {
      id: 4,
      icon: 'CheckCircle',
      label: 'Compliance Ready',
      description: 'Meets all regulatory standards'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {securityFeatures?.map((feature) => (
        <div
          key={feature?.id}
          className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-smooth"
        >
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <Icon name={feature?.icon} size={20} color="var(--color-primary)" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {feature?.label}
            </h4>
            <p className="text-xs text-muted-foreground">
              {feature?.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecurityBadges;