import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const AlertConfiguration = ({ alertSettings, onSettingsChange, onSaveSettings }) => {
  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8 shadow-md">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Icon name="Bell" size={24} color="var(--color-warning)" />
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
          Alert Configuration
        </h2>
      </div>
      <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
        Configure automatic notifications when noise levels exceed municipal regulations or health guidelines
      </p>
      <div className="space-y-4 md:space-y-6">
        <div className="bg-muted rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-medium text-foreground mb-3 md:mb-4">
            Notification Channels
          </h3>
          <div className="space-y-3">
            <Checkbox
              label="Email Notifications"
              description="Receive alerts via email"
              checked={alertSettings?.email}
              onChange={(e) => onSettingsChange('email', e?.target?.checked)}
            />
            <Checkbox
              label="SMS Notifications"
              description="Receive alerts via text message"
              checked={alertSettings?.sms}
              onChange={(e) => onSettingsChange('sms', e?.target?.checked)}
            />
            <Checkbox
              label="Push Notifications"
              description="Receive alerts on your device"
              checked={alertSettings?.push}
              onChange={(e) => onSettingsChange('push', e?.target?.checked)}
            />
            <Checkbox
              label="Dashboard Alerts"
              description="Show alerts on the main dashboard"
              checked={alertSettings?.dashboard}
              onChange={(e) => onSettingsChange('dashboard', e?.target?.checked)}
            />
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-medium text-foreground mb-3 md:mb-4">
            Alert Triggers
          </h3>
          <div className="space-y-3">
            <Checkbox
              label="Threshold Exceeded"
              description="Alert when noise exceeds configured thresholds"
              checked={alertSettings?.thresholdExceeded}
              onChange={(e) => onSettingsChange('thresholdExceeded', e?.target?.checked)}
            />
            <Checkbox
              label="Prolonged Exposure"
              description="Alert when harmful levels persist for extended periods"
              checked={alertSettings?.prolongedExposure}
              onChange={(e) => onSettingsChange('prolongedExposure', e?.target?.checked)}
            />
            <Checkbox
              label="Sudden Spike"
              description="Alert on rapid noise level increases"
              checked={alertSettings?.suddenSpike}
              onChange={(e) => onSettingsChange('suddenSpike', e?.target?.checked)}
            />
            <Checkbox
              label="Regulation Violation"
              description="Alert when municipal noise regulations are violated"
              checked={alertSettings?.regulationViolation}
              onChange={(e) => onSettingsChange('regulationViolation', e?.target?.checked)}
            />
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-medium text-foreground mb-3 md:mb-4">
            Alert Priority
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <Icon name="AlertTriangle" size={20} color="var(--color-error)" />
                <div>
                  <div className="text-sm font-medium text-foreground">Critical Alerts</div>
                  <div className="text-xs text-muted-foreground">Immediate attention required</div>
                </div>
              </div>
              <Checkbox
                checked={alertSettings?.criticalPriority}
                onChange={(e) => onSettingsChange('criticalPriority', e?.target?.checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <Icon name="AlertCircle" size={20} color="var(--color-warning)" />
                <div>
                  <div className="text-sm font-medium text-foreground">High Priority</div>
                  <div className="text-xs text-muted-foreground">Requires prompt action</div>
                </div>
              </div>
              <Checkbox
                checked={alertSettings?.highPriority}
                onChange={(e) => onSettingsChange('highPriority', e?.target?.checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <Icon name="Info" size={20} color="var(--color-primary)" />
                <div>
                  <div className="text-sm font-medium text-foreground">Standard Alerts</div>
                  <div className="text-xs text-muted-foreground">Informational notifications</div>
                </div>
              </div>
              <Checkbox
                checked={alertSettings?.standardPriority}
                onChange={(e) => onSettingsChange('standardPriority', e?.target?.checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="default"
            iconName="Save"
            iconPosition="left"
            onClick={onSaveSettings}
            fullWidth
          >
            Save Alert Settings
          </Button>
          <Button
            variant="outline"
            iconName="RotateCcw"
            iconPosition="left"
            onClick={() => {}}
            fullWidth
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertConfiguration;