import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LanguageProvider } from './contexts/LanguageContext'; // Import LanguageProvider
import MainLayout from './components/Layout/MainLayout';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './components/Dashboard/Dashboard';
import DeviceList from './components/Devices/DeviceList';
import DeviceDetail from './components/Devices/DeviceDetail';
import BlockingPolicyList from './components/BlockingPolicy/BlockingPolicyList';
import DepartmentList from './components/Departments/DepartmentList';
import UserManagement from './components/Users/UserManagement';
import { useTranslation } from './hooks/useTranslation'; // Import useTranslation

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation(); // Use translation hook

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation(); // Use translation hook

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

function App() {
  return (
    <LanguageProvider> {/* Wrap the entire app with LanguageProvider */}
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <RegisterForm />
                </PublicRoute>
              } />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/devices" element={
                <ProtectedRoute>
                  <MainLayout>
                    <DeviceList />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/device/:id" element={
                <ProtectedRoute>
                  <MainLayout>
                    <DeviceDetail />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/blocking-policy" element={
                <ProtectedRoute>
                  <MainLayout>
                    <BlockingPolicyList />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/departments" element={
                <ProtectedRoute>
                  <MainLayout>
                    <DepartmentList />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/user-management" element={
                <ProtectedRoute>
                  <MainLayout>
                    <UserManagement />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;