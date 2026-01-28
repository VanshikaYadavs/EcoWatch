import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { useTranslation } from 'react-i18next';

const AlertConfiguration = ({ alertSettings, onSettingsChange, onSaveSettings }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8 shadow-md">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Icon name="Bell" size={24} color="var(--color-warning)" />
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
          {t('noise.alerts.title')}
        </h2>
      </div>
      <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
        {t('noise.alerts.subtitle')}
      </p>
      <div className="space-y-4 md:space-y-6">
        <div className="bg-muted rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-medium text-foreground mb-3 md:mb-4">
            {t('noise.alerts.notificationChannels')}
          </h3>
          <div className="space-y-3">
            <Checkbox
              label={t('noise.alerts.email')}
              description={t('noise.alerts.email.desc')}
              checked={alertSettings?.email}
              onChange={(e) => onSettingsChange('email', e?.target?.checked)}
            />
            <Checkbox
              label={t('noise.alerts.sms')}
              description={t('noise.alerts.sms.desc')}
              checked={alertSettings?.sms}
              onChange={(e) => onSettingsChange('sms', e?.target?.checked)}
            />
            <Checkbox
              label={t('noise.alerts.push')}
              description={t('noise.alerts.push.desc')}
              checked={alertSettings?.push}
              onChange={(e) => onSettingsChange('push', e?.target?.checked)}
            />
            <Checkbox
              label={t('noise.alerts.dashboard')}
              description={t('noise.alerts.dashboard.desc')}
              checked={alertSettings?.dashboard}
              onChange={(e) => onSettingsChange('dashboard', e?.target?.checked)}
            />
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-medium text-foreground mb-3 md:mb-4">
            {t('noise.alerts.alertTriggers')}
          </h3>
          <div className="space-y-3">
            <Checkbox
              label={t('noise.alerts.thresholdExceeded')}
              description={t('noise.alerts.thresholdExceeded.desc')}
              checked={alertSettings?.thresholdExceeded}
              onChange={(e) => onSettingsChange('thresholdExceeded', e?.target?.checked)}
            />
            <Checkbox
              label={t('noise.alerts.prolongedExposure')}
              description={t('noise.alerts.prolongedExposure.desc')}
              checked={alertSettings?.prolongedExposure}
              onChange={(e) => onSettingsChange('prolongedExposure', e?.target?.checked)}
            />
            <Checkbox
              label={t('noise.alerts.suddenSpike')}
              description={t('noise.alerts.suddenSpike.desc')}
              checked={alertSettings?.suddenSpike}
              onChange={(e) => onSettingsChange('suddenSpike', e?.target?.checked)}
            />
            <Checkbox
              label={t('noise.alerts.regulationViolation')}
              description={t('noise.alerts.regulationViolation.desc')}
              checked={alertSettings?.regulationViolation}
              onChange={(e) => onSettingsChange('regulationViolation', e?.target?.checked)}
            />
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-medium text-foreground mb-3 md:mb-4">
            {t('noise.alerts.alertPriority')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <Icon name="AlertTriangle" size={20} color="var(--color-error)" />
                <div>
                  <div className="text-sm font-medium text-foreground">{t('noise.alerts.priority.critical')}</div>
                  <div className="text-xs text-muted-foreground">{t('noise.alerts.priority.critical.desc')}</div>
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
                  <div className="text-sm font-medium text-foreground">{t('noise.alerts.priority.high')}</div>
                  <div className="text-xs text-muted-foreground">{t('noise.alerts.priority.high.desc')}</div>
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
                  <div className="text-sm font-medium text-foreground">{t('noise.alerts.priority.standard')}</div>
                  <div className="text-xs text-muted-foreground">{t('noise.alerts.priority.standard.desc')}</div>
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
            {t('noise.alerts.button.save')}
          </Button>
          <Button
            variant="outline"
            iconName="RotateCcw"
            iconPosition="left"
            onClick={() => {}}
            fullWidth
          >
            {t('noise.alerts.button.reset')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertConfiguration;