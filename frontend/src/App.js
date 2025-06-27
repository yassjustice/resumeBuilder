import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';  
import { CVProvider } from './contexts/CVContext';
import { TailoredCVProvider } from './contexts/TailoredCVContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Enhanced components
import ErrorBoundary from './components/UI/ErrorBoundary';
import ToastProvider from './components/UI/ToastProvider';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CVBuilderPage from './pages/CVBuilderPage';
import JobApplicationPage from './pages/JobApplicationPage';
import AdvancedJobApplicationPage from './pages/AdvancedJobApplicationPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CVProvider>            <TailoredCVProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route 
                      path="dashboard" 
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="cv-builder" 
                      element={
                        <ProtectedRoute>
                          <CVBuilderPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="job-application" 
                      element={
                        <ProtectedRoute>
                          <JobApplicationPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="advanced-job-application" 
                      element={
                        <ProtectedRoute>
                          <AdvancedJobApplicationPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="profile" 
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </Router>
            </TailoredCVProvider>
          </CVProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
