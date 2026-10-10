import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { TopicsPage } from './pages/TopicsPage';
import { RoomsPage } from './pages/RoomsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { VoiceRoomPreviewPage } from './pages/VoiceRoomPreviewPage';
import { PartnerPage } from './pages/PartnerPage';
import { ProgressPage } from './pages/ProgressPage';
import { AdminPage } from './pages/AdminPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { RefundPolicyPage } from './pages/RefundPolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Main Application with standard Navbar and Footer */}
              <Route element={<AppLayout />}>
                {/* Public Routes */}
                <Route path="/" element={<RoomsPage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/topics" element={<TopicsPage />} />
                <Route path="/home" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/rooms/:id" element={<VoiceRoomPreviewPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/refund" element={<RefundPolicyPage />} />

                {/* Profile Setup Route (Protected) */}
                <Route
                  path="/profile/setup"
                  element={
                    <ProtectedRoute>
                      <ProfileSetupPage />
                    </ProtectedRoute>
                  }
                />

                {/* Member / Authenticated Routes (Protected) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/edit"
                  element={
                    <ProtectedRoute>
                      <EditProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rooms/create"
                  element={
                    <ProtectedRoute>
                      <CreateRoomPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner"
                  element={
                    <ProtectedRoute>
                      <PartnerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions"
                  element={
                    <ProtectedRoute>
                      <ProgressPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/progress"
                  element={
                    <ProtectedRoute>
                      <ProgressPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <EditProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes (Restricted to Authorized Administrators Only) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/rooms"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
