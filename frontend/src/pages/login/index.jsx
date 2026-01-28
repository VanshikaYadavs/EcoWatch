import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import AutoText from '../../components/ui/AutoText';

import LoginForm from './components/LoginForm';
import EnvironmentalPreview from './components/EnvironmentalPreview';
import SecurityBadges from './components/SecurityBadges';

const Login = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>Login - EchoWatch Environmental Monitoring</title>
        <meta name="description" content="Secure login portal for EchoWatch environmental monitoring system. Access real-time air quality, noise levels, temperature data and alerts." />
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border shadow-sm">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Icon name="Waves" size={28} color="#FFFFFF" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">
                    EchoWatch
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Environmental Monitoring System
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-success">System Active</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
            <div className="flex flex-col justify-center">
              <div className="bg-card border border-border rounded-2xl shadow-xl p-6 md:p-8 lg:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    <AutoText i18nKey="login.welcome" defaultText="Welcome Back" />
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    <AutoText i18nKey="login.subtitle" defaultText="Sign in to access the environmental monitoring dashboard" />
                  </p>
                </div>

                <LoginForm />

                <div className="mt-8">
                  <SecurityBadges />
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('login.needAccess')}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  support@echowatch.gov • +1 (555) 123-4567
                </p>
              </div>
            </div>

            <div className="hidden lg:flex flex-col justify-center">
              <EnvironmentalPreview />
            </div>
          </div>
        </main>

        <footer className="bg-card border-t border-border mt-auto">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>&copy; {new Date()?.getFullYear()} EchoWatch. All rights reserved.</span>
                <span className="hidden md:inline">•</span>
                <a href="#" className="hover:text-foreground transition-smooth hidden md:inline">
                  Privacy Policy
                </a>
                <span className="hidden md:inline">•</span>
                <a href="#" className="hover:text-foreground transition-smooth hidden md:inline">
                  Terms of Service
                </a>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Globe" size={16} />
                  <span>{t('login.languageLabel')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="MapPin" size={16} />
                  <span>{t('login.countryLabel')}</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Login;