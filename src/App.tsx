import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ThreatFeed from "./pages/ThreatFeed";
import BulkScan from "./pages/BulkScan";
import Report from "./pages/Report";
import ResetPassword from "./pages/ResetPassword";
import Pricing from "./pages/Pricing";
import ApiDocs from "./pages/ApiDocs";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import SecurityPolicy from "./pages/SecurityPolicy";
import HallOfFame from "./pages/HallOfFame";
import Contact from "./pages/Contact";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/threats" element={<ThreatFeed />} />
            <Route path="/bulk" element={<BulkScan />} />
            <Route path="/report/:scanId" element={<Report />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/api" element={<ApiDocs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/security-policy" element={<SecurityPolicy />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="/contact" element={<Contact />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
