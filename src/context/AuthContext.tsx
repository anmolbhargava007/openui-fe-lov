import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "@/services/authApi";
import {
  User,
  SigninRequest,
  SignupRequest,
  ApiResponse,
} from "@/types/api";

interface AuthContextType {
  token: string | null;
  user: User | null;
  userRole: number | null;
  isAuthenticated: boolean;
  signin: (credentials: SigninRequest) => Promise<boolean>;
  signup: (userData: SignupRequest) => Promise<boolean>;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const signin = async (credentials: SigninRequest): Promise<boolean> => {
    try {
      const response = await authApi.signin(credentials);
      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data);
        setUserRole(response.data.role_id);
        setIsAuthenticated(true);
        console.log("Successfully signed in:", response.data);

        // Role-based redirects
        if (response.data.role_id === 1) {
          // Super Admin - redirect to dashboard
          navigate('/dashboard');
        } else if (response.data.role_id === 2) {
          // Guest - redirect to workspace
          navigate('/workspace');
        } else {
          // Default fallback
          navigate('/');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Signin error:", error);
      toast.error("Invalid credentials. Please try again.");
      return false;
    }
  };

  const signup = async (userData: SignupRequest): Promise<boolean> => {
    try {
      const response = await authApi.signup(userData);
      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data);
        setUserRole(response.data.role_id);
        setIsAuthenticated(true);
        console.log("Successfully signed up:", response.data);
        navigate("/");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to sign up. Please try again.");
      return false;
    }
  };

  const signout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    navigate("/signin");
  };

  const value: AuthContextType = {
    token,
    user,
    userRole,
    isAuthenticated,
    signin,
    signup,
    signout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
