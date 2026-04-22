import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

// ── Code-split lazy imports (reduces initial bundle from 777KB) ──
const Login        = lazy(() => import('./pages/Login'));
const Register     = lazy(() => import('./pages/Register'));
const Dashboard    = lazy(() => import('./pages/Dashboard'));
const PredictFraud = lazy(() => import('./pages/PredictFraud'));
const PredictPremium = lazy(() => import('./pages/PredictPremium'));
const Settings     = lazy(() => import('./pages/Settings'));
const ClaimsHistory = lazy(() => import('./pages/ClaimsHistory'));
const Reports      = lazy(() => import('./pages/Reports'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const Layout       = lazy(() => import('./components/layout/Layout'));

// ── Full-page spinner shown during lazy chunk loading ──
const PageLoader = () => (
  <div style={{
    minHeight: '100vh',
    background: '#0F0F1A',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  }}>
    <div style={{
      width: 44, height: 44,
      border: '3px solid rgba(59,130,246,0.2)',
      borderTopColor: '#3B82F6',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
    <p style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
      Initializing InsureGuard...
    </p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard"      element={<Dashboard />} />
          <Route path="predict-fraud"  element={<PredictFraud />} />
          <Route path="predict-premium" element={<PredictPremium />} />
          <Route path="claims"         element={<ClaimsHistory />} />
          <Route path="reports"        element={<Reports />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="settings"       element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'var(--surface, #1A1A2E)',
                color: 'var(--text-1, #F9FAFB)',
                border: '1px solid var(--border, rgba(255,255,255,0.07))',
                borderRadius: 12,
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              },
              success: {
                iconTheme: { primary: '#34D399', secondary: '#1A1A2E' },
              },
              error: {
                iconTheme: { primary: '#F87171', secondary: '#1A1A2E' },
              },
            }}
          />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
