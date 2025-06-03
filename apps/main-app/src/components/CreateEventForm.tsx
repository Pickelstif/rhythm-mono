import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Event } from "@/types";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  eventType: z.enum(["rehearsal", "gig"]),
  date: z.date(),
  location: z.string().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
});

export type FormValues = z.infer<typeof eventFormSchema>;

interface CreateEventFormProps {
  bandId: string;
  onSubmit: (values: FormValues) => Promise<void>;
  initialDate?: Date | null;
  editingEvent?: Event | null;
}

export function CreateEventForm({ bandId, onSubmit, initialDate, editingEvent }: CreateEventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: editingEvent?.title || "",
      eventType: editingEvent?.eventType || "rehearsal",
      date: editingEvent?.startTime || initialDate || new Date(),
      location: editingEvent?.location || "",
      startTime: editingEvent ? format(editingEvent.startTime, "HH:mm") : "19:00",
    },
  });

  useEffect(() => {
    if (editingEvent) {
      form.reset({
        title: editingEvent.title,
        eventType: editingEvent.eventType,
        date: editingEvent.startTime,
        location: editingEvent.location || "",
        startTime: format(editingEvent.startTime, "HH:mm"),
      });
    } else if (!form.formState.isDirty) {
      form.reset({
        title: "",
        eventType: "rehearsal",
        date: initialDate || new Date(),
        location: "",
        startTime: "19:00",
      });
    }
  }, [editingEvent, initialDate, form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error(editingEvent ? "Error updating event:" : "Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="rehearsal">Rehearsal</SelectItem>
                  <SelectItem value="gig">Gig</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "MMMM d, yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[300px]">
                    {Array.from({ length: 24 }).map((_, hour) => (
                      [0, 15, 30, 45].map((minute) => {
                        const formattedHour = hour.toString().padStart(2, '0');
                        const formattedMinute = minute.toString().padStart(2, '0');
                        const timeValue = `${formattedHour}:${formattedMinute}`;
                        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                        const displayTime = `${displayHour}:${formattedMinute} ${hour >= 12 ? 'PM' : 'AM'}`;
                        
                        return (
                          <SelectItem key={timeValue} value={timeValue}>
                            {displayTime}
                          </SelectItem>
                        );
                      })
                    )).flat()}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (editingEvent ? "Updating..." : "Creating...") : (editingEvent ? "Update Event" : "Create Event")}
        </Button>
      </form>
    </Form>
  );
} 