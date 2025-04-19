import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const cleanupPastEvents = async (): Promise<void> => {
  try {
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      console.error('No active session found');
      return;
    }

    // Use the supabase client to directly delete past events instead of calling the edge function
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format as YYYY-MM-DD
    const formattedDate = yesterday.toISOString().split('T')[0];
    
    const { data, error, count } = await supabase
      .from('events')
      .delete({ count: 'exact' })
      .lt('date', formattedDate);
    
    if (error) {
      throw error;
    }
    
    console.log('Past events cleanup result:', { deleted_count: count });
    
    if (count && count > 0) {
      toast.success(`Cleaned up ${count} past events`);
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