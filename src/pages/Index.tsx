
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      // Redirect based on authentication state
      navigate(isAuthenticated ? '/dashboard' : '/signin');
    }
  }, [navigate, isAuthenticated, loading]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading DataGPT...</h1>
      </div>
    </div>
  );
};

export default Index;
