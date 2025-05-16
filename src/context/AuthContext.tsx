
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User, SigninRequest, SignupRequest } from "@/types/auth";
import { toast } from "sonner";
import { authApi } from "@/services/authApi";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signin: (credentials: SigninRequest) => Promise<boolean>;
  signup: (userData: SignupRequest) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("user");
      }
    }
    
    setLoading(false);
  }, []);

  const signin = async (credentials: SigninRequest): Promise<boolean> => {
    try {
      const response = await authApi.signin(credentials);
      
      if (response.success && response.data && response.data.length > 0) {
        const userData = response.data[0];
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Signed in successfully");
        navigate("/dashboard");
        return true;
      } else {
        toast.error(response.msg || "Failed to sign in");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in. Please check your credentials.");
      return false;
    }
  };

  const signup = async (userData: SignupRequest): Promise<boolean> => {
    try {
      const response = await authApi.signup(userData);
      
      if (response.success) {
        toast.success("Account created successfully. Please sign in.");
        navigate("/signin");
        return true;
      } else {
        toast.error(response.msg || "Failed to create account");
        return false;
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account. Please try again.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, signin, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
