import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import MainLayout from "./layouts/MainLayout";
import UnsignedDashboard from "./pages/unsigned-dashboard";
import NoiseLevelTracking from './pages/noise-level-tracking';
import Login from './pages/login';
import Signup from './pages/signup';
import TemperatureAnalytics from './pages/temperature-analytics';
import HistoricalReports from './pages/historical-reports';
import EnvironmentalDashboard from './pages/environmental-dashboard';
import AirQualityMonitor from './pages/air-quality-monitor';
import NotificationSettings from './pages/notification-setting';
import UserProfile from './pages/user-profile';
import ComparativeAnalysis from './pages/comparative-analysis';
import AlertCenter from './pages/alert-center';
import { useAuth } from './auth/AuthProvider';
import AuthCallback from './pages/auth-callback';
import ProfileSetup from './pages/profile-setup';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
      <span>Loading…</span>
    </div>
  </div>
);

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RedirectIfAuthed = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/environmental-dashboard" replace />;
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
        <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/profile-setup" element={<RequireAuth><ProfileSetup /></RequireAuth>} />

        {/* Authenticated app shell (static sidebar) */}
        <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route path="/environmental-dashboard" element={<EnvironmentalDashboard />} />
          <Route path="/air-quality-monitor" element={<AirQualityMonitor />} />
          <Route path="/noise-level-tracking" element={<NoiseLevelTracking />} />
          <Route path="/temperature-analytics" element={<TemperatureAnalytics />} />
          <Route path="/historical-reports" element={<HistoricalReports />} />
          <Route path="/alert-center" element={<AlertCenter />} />
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
