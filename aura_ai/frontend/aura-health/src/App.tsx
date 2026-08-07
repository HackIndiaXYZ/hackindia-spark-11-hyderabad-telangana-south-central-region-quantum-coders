import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "./pages/Landing.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import HomeDashboard from "./pages/HomeDashboard.tsx";
import MyHealthPage from "./pages/MyHealthPage.tsx";
import AdvancedDigitalTwin from "./pages/AdvancedDigitalTwin.tsx";
import BodySimulation from "./pages/BodySimulation.tsx";
import AuraAIPage from "./pages/AuraAIPage.tsx";
import DoctorsPage from "./pages/DoctorsPage.tsx";
import MedicalReportsPage from "./pages/MedicalReportsPage.tsx";
import HealthOutlookPage from "./pages/HealthOutlookPage.tsx";
import HealthHistoryPage from "./pages/HealthHistoryPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import ClinicalEnginePage from "./pages/ClinicalEnginePage.tsx";
import ClinicalMethodology from "./pages/ClinicalMethodology.tsx";
import LifestyleMethodology from "./pages/LifestyleMethodology.tsx";
import PassportPage from "./pages/PassportPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

import "./i18n/config"; // Initialize i18n
import { useStore } from "@/store/useStore";

const queryClient = new QueryClient();

const App = () => {
  const initializeAuth = useStore((s) => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Healthcare Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <HomeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-health"
              element={
                <ProtectedRoute>
                  <MyHealthPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/digital-twin"
              element={
                <ProtectedRoute>
                  <AdvancedDigitalTwin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/3d-twin"
              element={
                <ProtectedRoute>
                  <BodySimulation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/body-simulation"
              element={
                <ProtectedRoute>
                  <BodySimulation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/aura-ai"
              element={
                <ProtectedRoute>
                  <AuraAIPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctors"
              element={
                <ProtectedRoute>
                  <DoctorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommend-doctors"
              element={
                <ProtectedRoute>
                  <DoctorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/realtime-doctors"
              element={
                <ProtectedRoute>
                  <DoctorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <MedicalReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-reports"
              element={
                <ProtectedRoute>
                  <MedicalReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/outlook"
              element={
                <ProtectedRoute>
                  <HealthOutlookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HealthHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health-history"
              element={
                <ProtectedRoute>
                  <HealthHistoryPage />
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
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/clinical-engine"
              element={
                <ProtectedRoute>
                  <ClinicalEnginePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clinical-methodology"
              element={
                <ProtectedRoute>
                  <ClinicalMethodology />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lifestyle-methodology"
              element={
                <ProtectedRoute>
                  <LifestyleMethodology />
                </ProtectedRoute>
              }
            />
            {/* Public Mobile Scanning Route for Passport/MedRouter */}
            <Route path="/passport" element={<PassportPage />} />
            <Route path="/medrouter" element={<PassportPage />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
