-- Add event_type column to events table
ALTER TABLE public.events
ADD COLUMN event_type TEXT NOT NULL DEFAULT 'rehearsal';

-- Add comment to explain the column
COMMENT ON COLUMN public.events.event_type IS 'Type of event: rehearsal or gig'; 