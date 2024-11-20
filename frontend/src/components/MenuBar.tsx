import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {jwtDecode} from 'jwt-decode';

const MenuBar: React.FC = () => {
  const navigateTo = useNavigate();
  const isAuthenticated = useAuth();
  let username = 'Guest';

  if (isAuthenticated) {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      console.log(decodedToken);
      username = decodedToken.username || 'User';
    }
  }

  const handleSignIn = () => {
    navigateTo('/signin');
  };

  const handleCreateAccount = () => {
    navigateTo('/create_account');
  };

  const handleAddPolicy = () => {
    navigateTo('/add_policy');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.setItem('logout', Date.now().toString());
    navigateTo(0);
  };

  return (
    <div className="menu-bar bg-gray-800 p-4 flex justify-between items-center">
      <div className="welcome text-white text-lg">Welcome, {username}</div>
      <div className="title text-white text-lg">Student Policy Management</div>
      
      <div className="actions flex space-x-4">
        {isAuthenticated ? (
          <>
            <button onClick={handleAddPolicy} className="add-policy bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700">Add Policy</button>
            <button onClick={handleLogout} className="logout bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700">Logout</button>
          </>
        ) : (
          <>
            <button onClick={handleSignIn} className="sign-in bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Sign In</button>
            <button onClick={handleCreateAccount} className="create-account bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">Create Account</button>
          </>
        )}
      </div>
    </div>
  );
}

export default MenuBar;