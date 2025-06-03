import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Header from '../components/Header';

type AuthMode = 'signIn' | 'signUp' | 'resetPassword';

const Auth = () => {
  const { user, signIn, signUp, resetPassword, loading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    if (authMode === 'signUp') {
      if (!password || !confirmPassword) return;
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      setFormLoading(true);
      try {
        await signUp(email, password);
      } catch (error) {
        // Error handling is done in the auth context
      } finally {
        setFormLoading(false);
      }
    } else if (authMode === 'signIn') {
      if (!password) return;
      
      setFormLoading(true);
      try {
        await signIn(email, password);
      } catch (error) {
        // Error handling is done in the auth context
      } finally {
        setFormLoading(false);
      }
    } else {
      // resetPassword
      setFormLoading(true);
      try {
        await resetPassword(email);
        setAuthMode('signIn');
      } catch (error) {
        // Error handling is done in the auth context
      } finally {
        setFormLoading(false);
      }
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case 'signUp':
        return 'Create Organizer Account';
      case 'resetPassword':
        return 'Reset Password';
      default:
        return 'Sign In';
    }
  };

  const getDescription = () => {
    switch (authMode) {
      case 'signUp':
        return 'Create your organizer account to get started';
      case 'resetPassword':
        return 'Enter your email to reset your password';
      default:
        return 'Sign in to your organizer account';
    }
  };

  const getButtonText = () => {
    if (formLoading) {
      switch (authMode) {
        case 'signUp':
          return 'Creating Account...';
        case 'resetPassword':
          return 'Sending Reset Email...';
        default:
          return 'Signing In...';
      }
    }
    
    switch (authMode) {
      case 'signUp':
        return 'Create Account';
      case 'resetPassword':
        return 'Send Reset Email';
      default:
        return 'Sign In';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rhythm-600 border-t-transparent mx-auto"></div>
          <p className="text-rhythm-600 dark:text-rhythm-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
        <div className="max-w-md w-full">
          <div className="bg-card rounded-2xl shadow-xl p-8 border">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                RhythmSync
              </h1>
              <h2 className="text-xl font-semibold text-rhythm-600 dark:text-rhythm-400 mb-2">
                Organizers Portal
              </h2>
              <p className="text-muted-foreground">
                {getDescription()}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rhythm-500 focus:border-transparent transition-colors bg-background"
                  placeholder="organizer@example.com"
                  required
                />
              </div>

              {(authMode === 'signIn' || authMode === 'signUp') && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rhythm-500 focus:border-transparent transition-colors bg-background"
                    placeholder={authMode === 'signUp' ? 'Create a secure password' : 'Enter your password'}
                    required
                    minLength={authMode === 'signUp' ? 6 : undefined}
                  />
                </div>
              )}

              {authMode === 'signUp' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rhythm-500 focus:border-transparent transition-colors bg-background"
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={formLoading}
                className="w-full"
                size="lg"
              >
                {formLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                    {getButtonText()}
                  </div>
                ) : (
                  getButtonText()
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {authMode === 'signIn' && (
                <>
                  <button
                    type="button"
                    onClick={() => setAuthMode('signUp')}
                    className="text-rhythm-600 dark:text-rhythm-400 hover:underline text-sm block w-full"
                  >
                    Don't have an account? Create one
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('resetPassword')}
                    className="text-rhythm-600 dark:text-rhythm-400 hover:underline text-sm block w-full"
                  >
                    Forgot your password?
                  </button>
                </>
              )}
              
              {authMode === 'signUp' && (
                <button
                  type="button"
                  onClick={() => setAuthMode('signIn')}
                  className="text-rhythm-600 dark:text-rhythm-400 hover:underline text-sm"
                >
                  Already have an account? Sign in
                </button>
              )}
              
              {authMode === 'resetPassword' && (
                <button
                  type="button"
                  onClick={() => setAuthMode('signIn')}
                  className="text-rhythm-600 dark:text-rhythm-400 hover:underline text-sm"
                >
                  Back to sign in
                </button>
              )}
            </div>

            <div className="mt-8 pt-6 border-t">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Organizer Portal</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {authMode === 'signUp' 
                    ? 'Create your organizer account to manage events, venues, and bookings.'
                    : 'This portal is exclusively for event organizers. Create an account or sign in to get started.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 