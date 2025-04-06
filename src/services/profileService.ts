import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

const parseNotificationPreferences = (prefString: string) => {
  try {
    return JSON.parse(prefString);
  } catch {
    return {
      emailNotifications: true,
      pushNotifications: true,
      practiceReminders: true,
      newCollaborationRequests: true,
      messageNotifications: true,
    };
  }
};

const stringifyNotificationPreferences = (prefs: any) => {
  return JSON.stringify(prefs);
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
        username: data.email.split('@')[0], // Derive username from email since we don't store it separately
        email: data.email,
        fullName: data.name,
        bio: '', // Not stored in users table
        avatarUrl: '', // Not stored in users table
        instruments: data.instruments || [],
        notificationPreferences: parseNotificationPreferences(data.notification_pref),
        createdAt: data.created_at,
        updatedAt: data.created_at, // Use created_at since we don't have updated_at
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('users')
        .update({
          name: profile.fullName,
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
        username: data.email.split('@')[0],
        email: data.email,
        fullName: data.name,
        bio: '', // Not stored in users table
        avatarUrl: '', // Not stored in users table
        instruments: data.instruments || [],
        notificationPreferences: parseNotificationPreferences(data.notification_pref),
        createdAt: data.created_at,
        updatedAt: data.created_at,
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