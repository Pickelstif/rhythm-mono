import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { checkUserIsLeader, cleanupPastEvents } from '@/utils/cleanupEvents';

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

  // Function to ensure user has correct user_type in database
  const ensureUserInDatabase = async (user: User) => {
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, user_type')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Error other than "not found"
        console.error('Error checking user in database:', fetchError);
        return;
      }

      if (!existingUser) {
        // User doesn't exist in our users table, create them
        // Default to 'band' type for main-app users
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            user_type: 'band', // Main-app users are band users by default
            notification_pref: 'email',
          });

        if (insertError) {
          console.error('Error creating user in database:', insertError);
        }
      }
    } catch (error) {
      console.error('Error ensuring user in database:', error);
    }
  };

  // Function to check if user is a leader and clean up past events
  const handleUserSession = async (session: Session | null) => {
    if (session?.user) {
      await ensureUserInDatabase(session.user);
      const isLeader = await checkUserIsLeader(session.user.id);
      if (isLeader) {
        await cleanupPastEvents();
      }
    }
  };

  useEffect(() => {
    const setData = async (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check if user is a leader and clean up past events
      await handleUserSession(session);
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      // Explicitly check for leader role after sign-in
      if (data.user) {
        await ensureUserInDatabase(data.user);
        const isLeader = await checkUserIsLeader(data.user.id);
        if (isLeader) {
          await cleanupPastEvents();
        }
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
      const { data, error: authError } = await supabase.auth.signUp({ 
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

      // Note: User will be created in database via trigger or when they first sign in
      // The trigger should automatically set user_type based on email
      
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
      navigate('/');
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
