import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Navigation & Global Components
import { DemoBanner } from './components/DemoBanner';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { ProtectedRoute } from './components/ProtectedRoute';

// 18 Required Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { CropRegistrationPage } from './pages/CropRegistrationPage';
import { ScannerPage } from './pages/ScannerPage';
import { DiagnosisResultPage } from './pages/DiagnosisResultPage';
import { DiseaseLibraryPage } from './pages/DiseaseLibraryPage';
import { TreatmentGuidePage } from './pages/TreatmentGuidePage';
import { WeatherPage } from './pages/WeatherPage';
import { OutbreakMapPage } from './pages/OutbreakMapPage';
import { ConsultationPage } from './pages/ConsultationPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { ExpertDashboard } from './pages/ExpertDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { SettingsPage } from './pages/SettingsPage';

// Layout wrapper for application views
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const location = useLocation();

  // Hide sidebar/navbar on landing, login, and registration pages
  const isAuthOrLanding = ['/', '/login', '/register'].includes(location.pathname);

  if (isAuthOrLanding) {
    return (
      <div className="min-h-screen bg-earth-50 flex flex-col selection:bg-forest-200">
        <DemoBanner />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 flex flex-col selection:bg-forest-200">
      {/* 1-Click Hackathon Evaluator Banner */}
      <DemoBanner />

      {/* Main App Navbar */}
      <Navbar
        onOpenVoice={() => setVoiceOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop & Mobile Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for Smartphone Users */}
      <MobileNav />

      {/* Multilingual Voice Assistant Dialog */}
      <VoiceAssistantModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppLayout>
            <Routes>
              {/* Public Marketing & Auth Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Farmer & General Access Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
              <Route path="/crops" element={<ProtectedRoute><CropRegistrationPage /></ProtectedRoute>} />
              <Route path="/scanner" element={<ProtectedRoute><ScannerPage /></ProtectedRoute>} />
              <Route path="/diagnosis/:id" element={<ProtectedRoute><DiagnosisResultPage /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><DiseaseLibraryPage /></ProtectedRoute>} />
              <Route path="/treatments" element={<ProtectedRoute><TreatmentGuidePage /></ProtectedRoute>} />
              <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><OutbreakMapPage /></ProtectedRoute>} />
              <Route path="/consult" element={<ProtectedRoute><ConsultationPage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><ScanHistoryPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/model-metrics" element={<ProtectedRoute><ModelPerformancePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              {/* Role-Restricted Portals */}
              <Route 
                path="/expert-dashboard" 
                element={<ProtectedRoute allowedRoles={['expert', 'admin']}><ExpertDashboard /></ProtectedRoute>} 
              />
              <Route 
                path="/admin-dashboard" 
                element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} 
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
