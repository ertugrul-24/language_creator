import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home, Languages, NewLanguagePage, Dictionary, Grammar, Courses, Settings } from '@/pages';
import LanguageDetailPage from '@/pages/LanguageDetailPage';
import DebugLanguagePage from '@/pages/DebugLanguagePage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import './styles/globals.css';

/**
 * ProtectedRoute - Redirect to login if user is not authenticated
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

/**
 * App - Main application component with routing and auth
 */
function App() {
  // Apply dark mode on mount
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/languages"
            element={
              <ProtectedRoute>
                <Languages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/languages/new"
            element={
              <ProtectedRoute>
                <NewLanguagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/languages/:languageId"
            element={
              <ProtectedRoute>
                <LanguageDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/debug/languages/:languageId"
            element={
              <ProtectedRoute>
                <DebugLanguagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dictionary"
            element={
              <ProtectedRoute>
                <Dictionary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grammar"
            element={
              <ProtectedRoute>
                <Grammar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login for unauthenticated users */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
