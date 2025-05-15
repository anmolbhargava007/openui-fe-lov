
import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

interface AuthLayoutProps {
  protected?: boolean;
}

export const AuthLayout = ({ protected: isProtected = false }: AuthLayoutProps) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // For protected routes, redirect to signin if not authenticated
  if (isProtected && !isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  // For authentication routes, redirect to dashboard if already authenticated
  if (!isProtected && isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};
