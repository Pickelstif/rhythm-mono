import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import { SchedulerPage } from "./features/scheduler/SchedulerPage";
import { MobileOnly } from "./components/MobileOnly";
import { useIsMobile } from "./hooks/useIsMobile";
import { MobileDashboard } from "./pages/MobileDashboard";
import { DailyViewer } from "./features/mobile/DailyViewer";

const queryClient = new QueryClient();

const App = () => {
  const isMobile = useIsMobile();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* These routes work on both mobile and desktop */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/reset-password" element={<Auth />} />
                
                {/* Conditional routing based on device type */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    {isMobile ? <MobileDashboard /> : <Dashboard />}
                  </ProtectedRoute>
                } />
                
                {/* Mobile-only routes */}
                {isMobile && (
                  <Route path="/daily" element={
                    <ProtectedRoute>
                      <DailyViewer />
                    </ProtectedRoute>
                  } />
                )}
                
                {/* Desktop-only routes */}
                {!isMobile && (
                  <Route path="/scheduler" element={
                    <ProtectedRoute>
                      <SchedulerPage />
                    </ProtectedRoute>
                  } />
                )}
                
                {/* Desktop-only message for scheduler on mobile */}
                {isMobile && (
                  <Route path="/scheduler" element={<MobileOnly />} />
                )}
              </Routes>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App; 