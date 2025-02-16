import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { validateToken } from '../api/login';

const ProtectedRoute = () => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsValid(false);
        return;
      }
      
      try {
        const user = await validateToken(token);
        setIsValid(!!user.id);  // Convert to boolean based on user existence
      } catch (error) {
        console.error('Token validation failed:', error);
        setIsValid(false);
      }
    };

    checkToken();
  }, [token]);

  if (isValid === null) {
    // Show loading state while validating
    return <div>Loading...</div>;
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 