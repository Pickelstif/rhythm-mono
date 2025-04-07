import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateEventForm } from "./CreateEventForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormValues } from "./CreateEventForm";

interface CreateEventModalProps {
  bandId: string;
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

export function CreateEventModal({ bandId, isOpen, onClose, onEventCreated }: CreateEventModalProps) {
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
      onEventCreated();
      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create event");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <CreateEventForm bandId={bandId} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
} 