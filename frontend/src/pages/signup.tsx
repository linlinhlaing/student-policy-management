import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {
      username: '',
      email: '',
      password: '',
    };
    
    if (!username.trim()) {
      errors.username = 'Username is required';
    }
    if (!email.trim()) {
      errors.email = 'Email is required';
    }
    if (!password.trim()) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return errors.username == '' && errors.email == '' && errors.password == '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    alert("success")
    e.preventDefault();
    
    
    if (!validateForm()) {
      alert('invalid form');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords need to be the same');
      return;
    }

    try {
      const response = await fetch('http://54.174.249.167:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(true);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/signin');
  };

  const isFormValid = username && email && password && confirmPassword && password === confirmPassword;

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-3 py-2 border rounded ${validationErrors.username ? 'border-red-500' : ''}`}
          />
          {validationErrors.username && <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 border rounded ${validationErrors.email ? 'border-red-500' : ''}`}
          />
          {validationErrors.email && <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded ${validationErrors.password ? 'border-red-500' : ''}`}
          />
          {validationErrors.password && <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full py-2 px-4 rounded ${isFormValid ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Create Account
        </button>
      </form>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <p>User registered successfully</p>
            <button onClick={handleModalClose} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
              OK
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Signup;
