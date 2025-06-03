import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@rhythm-sync/database';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isOrganizer: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  syncAuthState: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to check if user has organizer role using the new user_type column
  const checkOrganizerRole = async (userId: string): Promise<boolean> => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', userId)
        .single();
        
      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        return false;
      }
      
      return userData.user_type === 'organizer';
    } catch (error) {
      console.error('Error checking organizer role:', error);
      return false;
    }
  };

  useEffect(() => {
    const setData = async (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const organizerStatus = await checkOrganizerRole(session.user.id);
        setIsOrganizer(organizerStatus);
      } else {
        setIsOrganizer(false);
      }
      
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        const organizerStatus = await checkOrganizerRole(data.user.id);
        setIsOrganizer(organizerStatus);
        
        if (!organizerStatus) {
          toast.error('Access denied. You need organizer permissions to access this app.');
          await supabase.auth.signOut();
          return;
        }
        
        toast.success('Successfully signed in!');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Error signing in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Ensure the user has organizer role in the database
        await ensureOrganizerInDatabase(data.user);
        
        // Set organizer status
        setIsOrganizer(true);
        
        if (data.session) {
          toast.success('Account created successfully! Welcome to RhythmSync Organizers.');
          navigate('/dashboard');
        } else {
          toast.success('Account created! Please check your email to verify your account.');
        }
      }
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Error creating account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to ensure user has organizer role in database
  const ensureOrganizerInDatabase = async (user: any) => {
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
        // User doesn't exist in our users table, create them as organizer
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Organizer',
            email: user.email || '',
            user_type: 'organizer', // Explicitly set as organizer for organizers-app signups
            notification_pref: 'email',
          });

        if (insertError) {
          console.error('Error creating organizer user in database:', insertError);
        }
      } else if (existingUser.user_type !== 'organizer') {
        // User exists but is not an organizer, update them
        const { error: updateError } = await supabase
          .from('users')
          .update({ user_type: 'organizer' })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating user to organizer role:', updateError);
        }
      }
    } catch (error) {
      console.error('Error ensuring organizer in database:', error);
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

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Check if there's an active session before attempting to sign out
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Supabase sign out error:', error);
          throw error;
        }
      }
      
      // Clear local state regardless of Supabase response
      setSession(null);
      setUser(null);
      setIsOrganizer(false);
      
      navigate('/');
      toast.success('Successfully signed out');
    } catch (error: unknown) {
      const authError = error as AuthError;
      console.error('Sign out error:', authError);
      
      // Even if there's an error, clear local state and navigate away
      // This ensures the user doesn't get stuck in a logged-in state
      setSession(null);
      setUser(null);
      setIsOrganizer(false);
      navigate('/');
      
      toast.error('Signed out with warnings');
    } finally {
      setLoading(false);
    }
  };

  const syncAuthState = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession?.user) {
        const organizerStatus = await checkOrganizerRole(currentSession.user.id);
        setSession(currentSession);
        setUser(currentSession.user);
        setIsOrganizer(organizerStatus);
      } else {
        setSession(null);
        setUser(null);
        setIsOrganizer(false);
      }
    } catch (error) {
      console.error('Error syncing auth state:', error);
      // If there's an error, assume no session
      setSession(null);
      setUser(null);
      setIsOrganizer(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isOrganizer,
      signIn, 
      signUp,
      signOut, 
      resetPassword, 
      syncAuthState,
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