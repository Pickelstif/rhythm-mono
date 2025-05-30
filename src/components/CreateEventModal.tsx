
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateEventForm } from "./CreateEventForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormValues } from "./CreateEventForm";
import { Event } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface CreateEventModalProps {
  bandId: string;
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
  initialDate?: Date | null;
  editingEvent?: Event | null;
}

export function CreateEventModal({ 
  bandId, 
  isOpen, 
  onClose, 
  onEventCreated,
  initialDate,
  editingEvent
}: CreateEventModalProps) {
  const { user } = useAuth();

  const checkUserPermissions = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data: memberData, error } = await supabase
        .from("band_members")
        .select("role")
        .eq("band_id", bandId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error checking permissions:", error);
        return false;
      }

      return memberData?.role === "leader";
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  };

  const validateEventInput = (values: FormValues) => {
    if (!values.title || values.title.trim().length === 0) {
      throw new Error('Event title is required');
    }
    
    if (values.title.length > 200) {
      throw new Error('Event title must be less than 200 characters');
    }
    
    if (values.location && values.location.length > 500) {
      throw new Error('Location must be less than 500 characters');
    }
    
    if (values.date < new Date()) {
      throw new Error('Event date cannot be in the past');
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      // Validate input
      validateEventInput(values);
      
      // Check permissions
      const hasPermission = await checkUserPermissions();
      if (!hasPermission) {
        toast.error("You don't have permission to create or edit events for this band");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Format the date and time for database
      const formattedDate = values.date.toISOString().split('T')[0];
      
      // Create a proper timestamp by combining date and time
      const [hours, minutes] = values.startTime.split(':');
      const startTime = new Date(values.date);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from("events")
          .update({
            title: values.title.trim(),
            location: values.location?.trim() || null,
            date: formattedDate,
            start_time: startTime.toISOString(),
            event_type: values.eventType,
          })
          .eq("id", editingEvent.id);

        if (error) {
          console.error("Database error:", error);
          throw new Error(error.message);
        }

        toast.success("Event updated successfully");
      } else {
        // Create new event
        const { error } = await supabase
          .from("events")
          .insert({
            band_id: bandId,
            created_by: user.id,
            title: values.title.trim(),
            location: values.location?.trim() || null,
            date: formattedDate,
            start_time: startTime.toISOString(),
            event_type: values.eventType,
          })
          .select()
          .single();

        if (error) {
          console.error("Database error:", error);
          throw new Error(error.message);
        }

        toast.success("Event created successfully");
      }
      
      onEventCreated();
      onClose();
    } catch (error) {
      console.error(editingEvent ? "Error updating event:" : "Error creating event:", error);
      toast.error(error instanceof Error ? error.message : editingEvent ? "Failed to update event" : "Failed to create event");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>
        <CreateEventForm 
          bandId={bandId} 
          onSubmit={handleSubmit} 
          initialDate={initialDate}
          editingEvent={editingEvent}
        />
      </DialogContent>
    </Dialog>
  );
}
