
import { UserProfile } from '../types';
import { supabase } from '@/integrations/supabase/client';

const parseNotificationPreferences = (prefString: string) => {
  try {
    return JSON.parse(prefString);
  } catch {
    return {
      emailNotifications: true,
      practiceReminders: true,
      newCollaborationRequests: true,
      messageNotifications: true,
    };
  }
};

const stringifyNotificationPreferences = (prefs: any) => {
  return JSON.stringify(prefs);
};

// Input validation helper
const validateProfileInput = (profile: UserProfile) => {
  if (!profile.fullName || profile.fullName.trim().length === 0) {
    throw new Error('Full name is required');
  }
  
  if (profile.fullName.length > 100) {
    throw new Error('Full name must be less than 100 characters');
  }
  
  if (profile.instruments && profile.instruments.length > 20) {
    throw new Error('Too many instruments specified');
  }
  
  // Validate instrument names
  if (profile.instruments) {
    for (const instrument of profile.instruments) {
      if (typeof instrument !== 'string' || instrument.length > 50) {
        throw new Error('Invalid instrument name');
      }
    }
  }
};

export const profileService = {
  async getUserProfile(): Promise<UserProfile> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('No profile found');

      return {
        id: data.id,
        email: data.email,
        fullName: data.name,
        instruments: data.instruments || [],
        notificationPreferences: parseNotificationPreferences(data.notification_pref),
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    try {
      // Validate input before processing
      validateProfileInput(profile);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('users')
        .update({
          name: profile.fullName.trim(),
          instruments: profile.instruments,
          notification_pref: stringifyNotificationPreferences(profile.notificationPreferences),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update profile');

      return {
        id: data.id,
        email: data.email,
        fullName: data.name,
        instruments: data.instruments || [],
        notificationPreferences: parseNotificationPreferences(data.notification_pref),
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Remove avatar functionality since it's not supported in the users table
  async updateAvatar(): Promise<{ avatarUrl: string }> {
    throw new Error('Avatar updates are not supported');
  },
};
