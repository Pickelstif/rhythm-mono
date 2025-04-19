import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const cleanupPastEvents = async (): Promise<void> => {
  try {
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      console.error('No active session found');
      return;
    }

    const response = await fetch('https://ndypjhbdytqcuenohppd.supabase.co/functions/v1/delete-past-events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Edge function responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Past events cleanup result:', result);

    if (result.deleted_count > 0) {
      toast.success(`Cleaned up ${result.deleted_count} past events`);
    }
  } catch (error) {
    console.error('Error cleaning up past events:', error);
  }
};

export const checkUserIsLeader = async (userId: string): Promise<boolean> => {
  try {
    // Check if user is a band leader in any band
    const { data: bandMembers, error: roleError } = await supabase
      .from('band_members')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'leader');
    
    if (roleError) {
      console.error('Error checking user role:', roleError);
      return false;
    }
    
    return bandMembers && bandMembers.length > 0;
  } catch (error) {
    console.error('Error checking if user is leader:', error);
    return false;
  }
}; 