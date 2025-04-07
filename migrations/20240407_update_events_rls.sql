-- Drop the existing policy
DROP POLICY IF EXISTS "Band leaders can manage events" ON public.events;

-- Create the updated policy
CREATE POLICY "Band leaders can manage events"
ON public.events FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.band_members
        WHERE band_id = events.band_id
        AND user_id = auth.uid()
        AND role = 'leader'
    )
); 