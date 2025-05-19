
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SigninPage from "./pages/SigninPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import { AuthProvider } from "./context/AuthContext";
import { AuthLayout } from "./components/AuthLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes without header */}
            <Route element={<AuthLayout />}>
              <Route path="/signin" element={<SigninPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            {/* Protected routes with header */}
            <Route element={<AuthLayout protected withHeader />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
            </Route>

            {/* Index route */}
            <Route path="/" element={<Index />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
