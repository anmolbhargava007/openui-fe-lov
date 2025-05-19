
import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import Header from "./Header";

interface AuthLayoutProps {
  protected?: boolean;
  withHeader?: boolean;
}

export const AuthLayout = ({ protected: isProtected = false, withHeader = false }: AuthLayoutProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (isProtected && !isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  if (!isProtected && isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      {withHeader && <Header />}
      <Outlet />
    </>
  );
};
