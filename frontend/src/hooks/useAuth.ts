
import { useEffect, useState } from 'react';
import { isLogin } from '../utils/authUtils';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(isLogin());

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(isLogin());
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return isAuthenticated;
};

export default useAuth;