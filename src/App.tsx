import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import BandDetail from "./pages/BandDetail";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import JoinBand from "./pages/JoinBand";

const queryClient = new QueryClient();

// Layout wrapper to ensure consistent page structure
const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <main className="flex-1 pb-32">
      {children}
    </main>
    <Footer />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<PageLayout><Landing /></PageLayout>} />
              <Route path="/auth" element={<PageLayout><Auth /></PageLayout>} />
              <Route path="/auth/reset-password" element={<PageLayout><Auth /></PageLayout>} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <PageLayout><Index /></PageLayout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <PageLayout><ProfilePage /></PageLayout>
                </ProtectedRoute>
              } />
              <Route path="/band/:bandId" element={
                <ProtectedRoute>
                  <PageLayout><BandDetail /></PageLayout>
                </ProtectedRoute>
              } />
              <Route path="/join-band/:bandId" element={
                <ProtectedRoute>
                  <PageLayout><JoinBand /></PageLayout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<PageLayout><NotFound /></PageLayout>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
