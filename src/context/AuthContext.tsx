import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const setData = (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setData(session);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setData(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      navigate('/');
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Error signing in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      toast.success('Sign up successful! Please check your email for verification.');
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Error signing up');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Password reset instructions sent to your email');
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Error resetting password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      toast.success('Password updated successfully');
      navigate('/');
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Error updating password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Error signing out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      signIn, 
      signUp, 
      signOut, 
      resetPassword, 
      updatePassword, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
