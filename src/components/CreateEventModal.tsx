import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreateEventForm } from "./CreateEventForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormValues } from "./CreateEventForm";
import { Event } from "@/types";

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
  const handleSubmit = async (values: FormValues) => {
    try {
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
            title: values.title,
            location: values.location || null,
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
            title: values.title,
            location: values.location || null,
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
          <DialogDescription>
            {editingEvent 
              ? "Update the details for this event." 
              : "Fill in the details to create a new event for your band."
            }
          </DialogDescription>
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