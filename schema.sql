-- Users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    instruments TEXT[],
    notification_pref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Bands table
CREATE TABLE public.bands (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT bands_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Band members table
CREATE TABLE public.band_members (
    id UUID PRIMARY KEY,
    band_id UUID,
    user_id UUID,
    role TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT band_members_band_id_fkey FOREIGN KEY (band_id) REFERENCES public.bands(id),
    CONSTRAINT band_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Availability table
CREATE TABLE public.availability (
    id UUID PRIMARY KEY,
    user_id UUID,
    band_id UUID,
    date DATE NOT NULL,
    source TEXT NOT NULL,
    parsed_from TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT availability_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT availability_band_id_fkey FOREIGN KEY (band_id) REFERENCES public.bands(id)
);

-- Events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY,
    band_id UUID,
    created_by UUID,
    title TEXT NOT NULL,
    location TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT events_band_id_fkey FOREIGN KEY (band_id) REFERENCES public.bands(id),
    CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY,
    user_id UUID,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_via TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.band_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_band_members_band_id ON public.band_members(band_id);
CREATE INDEX idx_band_members_user_id ON public.band_members(user_id);
CREATE INDEX idx_availability_user_id ON public.availability(user_id);
CREATE INDEX idx_availability_band_id ON public.availability(band_id);
CREATE INDEX idx_availability_date ON public.availability(date);
CREATE INDEX idx_events_band_id ON public.events(band_id);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- Bands policies
CREATE POLICY "Anyone can view bands"
ON public.bands FOR SELECT
USING (true);

CREATE POLICY "Users can create bands"
ON public.bands FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Band leaders can update their bands"
ON public.bands FOR UPDATE
USING (
    auth.uid() = created_by OR
    EXISTS (
        SELECT 1 FROM public.band_members
        WHERE band_id = bands.id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Band members policies
CREATE POLICY "Users can view their own band memberships"
ON public.band_members FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view band members for their bands"
ON public.band_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.band_members
        WHERE band_id = band_members.band_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Band leaders can manage members"
ON public.band_members FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.band_members
        WHERE band_id = band_members.band_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Availability policies
CREATE POLICY "Users can view their own availability"
ON public.availability FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view band availability"
ON public.availability FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.band_members
        WHERE band_id = availability.band_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their own availability"
ON public.availability FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Band leaders can manage member availability"
ON public.availability FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.band_members
        WHERE band_id = availability.band_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Events policies
CREATE POLICY "Band members can view events"
ON public.events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.band_members
        WHERE band_id = events.band_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Band leaders can manage events"
ON public.events FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.band_members
        WHERE band_id = events.band_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notifications"
ON public.notifications FOR ALL
USING (auth.uid() = user_id); 