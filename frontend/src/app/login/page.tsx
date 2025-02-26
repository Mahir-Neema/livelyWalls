'use client';

import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (response: CredentialResponse) => {
    if (response.credential) {
      const tokenId = response.credential;
      // Send the token to the Go backend for verification
      fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenId }),
      })
        .then((res) => res.json())
        .then((data) => console.log('Logged in user data:', data))
        .catch((error) => console.error('Error logging in:', error));
    }
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Both username and password are required.');
      return;
    }
    // Handle normal login (username/password)
    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Logged in user data:', data);
        // Clear error if login is successful
        setError('');
      })
      .catch((error) => {
        setError('Login failed, please try again.');
        console.error('Error logging in:', error);
      });
  };

  return (
    <div className="mt-6 flex justify-center">
      <div className="bg-white p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {/* Normal Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        {/* Google Login Button */}
        <div className="mt-6">
          <GoogleLogin
            onSuccess={handleLogin}
            onError={handleError}
            useOneTap
            containerProps={{ className: "w-full bg-red-500 text-white rounded-md hover:bg-red-600" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
