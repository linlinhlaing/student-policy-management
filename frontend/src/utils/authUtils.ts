import { jwtDecode } from 'jwt-decode';

export const isLogin = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp > currentTime) {
        return true;
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('token');
    }
  }
  return false;
};