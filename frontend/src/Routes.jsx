import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import MainLayout from "./layouts/MainLayout";
import UnsignedDashboard from "./pages/unsigned-dashboard";
import NoiseLevelTracking from './pages/noise-level-tracking';
import Login from './pages/login';
import TemperatureAnalytics from './pages/temperature-analytics';
import HistoricalReports from './pages/historical-reports';
import EnvironmentalDashboard from './pages/environmental-dashboard';
import AirQualityMonitor from './pages/air-quality-monitor';
import NotificationSettings from './pages/notification-setting';
import UserProfile from './pages/user-profile';
import ComparativeAnalysis from './pages/comparative-analysis';

const AUTH_KEY = 'ecowatch.auth';

const isAuthenticated = () =>
  localStorage.getItem(AUTH_KEY) === '1' || sessionStorage.getItem(AUTH_KEY) === '1';

const RequireAuth = ({ children }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
};

const RedirectIfAuthed = ({ children }) => {
  if (isAuthenticated()) return <Navigate to="/environmental-dashboard" replace />;
  return children;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<UnsignedDashboard />} />
        <Route path="/unsigned-dashboard" element={<UnsignedDashboard />} />

        <Route path="/comparative-analysis" element={<ComparativeAnalysis />} />

        <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />

        {/* Authenticated app shell (static sidebar) */}
        <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route path="/environmental-dashboard" element={<EnvironmentalDashboard />} />
          <Route path="/air-quality-monitor" element={<AirQualityMonitor />} />
          <Route path="/noise-level-tracking" element={<NoiseLevelTracking />} />
          <Route path="/temperature-analytics" element={<TemperatureAnalytics />} />
          <Route path="/historical-reports" element={<HistoricalReports />} />
          <Route path="/notification-settings" element={<NotificationSettings />} />
          <Route path="/user-profile" element={<UserProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
