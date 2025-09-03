import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import DarkModeToggle from '../components/DarkModeToggle';
import { authApi } from '../utils/api';
import type { LoginInput, RegisterInput } from '../types/auth';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const handleSignIn = async (data: RegisterInput | LoginInput) => {
    try {
      const response = await authApi.login(data);
      // Store the token in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <DarkModeToggle />
          </div>
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            BookFinder
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Or{' '}
            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <AuthForm mode="login" onSubmit={handleSignIn} />
      </div>
    </div>
  );
};

export default SignInPage;
