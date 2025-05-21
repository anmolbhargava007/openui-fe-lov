
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '@/services/authApi';
import { useNavigate } from 'react-router-dom';
import { SigninRequest, SignupRequest, UserRole, AuthContextType, User } from '@/types/auth';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.User);
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedExpiry = localStorage.getItem('expiryDate');

        if (storedUser && storedExpiry) {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
          setExpiryDate(storedExpiry);

          // Set user role
          if (parsedUser.role_id === 1) {
            setUserRole(UserRole.Admin);
          } else {
            setUserRole(UserRole.User);
          }

          // Check if token is expired
          if (new Date(storedExpiry) < new Date()) {
            logout();
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signin = async (credentials: SigninRequest) => {
    try {
      setLoading(true);
      const response = await authApi.signin(credentials);
      
      if (response.success && response.data && response.data.length > 0) {
        const userData = response.data[0];
        const expiryTime = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24 hours
        
        setUser(userData);
        setExpiryDate(expiryTime.toISOString());
        
        if (userData.role_id === 1) {
          setUserRole(UserRole.Admin);
        } else {
          setUserRole(UserRole.User);
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('expiryDate', expiryTime.toISOString());
        
        navigate('/dashboard');
        
        toast.success("Logged in successfully");
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupRequest) => {
    try {
      setLoading(true);
      const response = await authApi.signup(userData);

      if (response.success) {
        toast.success("Account created successfully! Please sign in.");
        navigate('/signin');
      } else {
        toast.error(response.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setExpiryDate(null);
    localStorage.removeItem('user');
    localStorage.removeItem('expiryDate');
    navigate('/signin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        signin,
        signup,
        logout,
        expiryDate,
        userRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
