-- Create the setlists table
CREATE TABLE setlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the setlist_songs junction table for songs in a setlist
CREATE TABLE setlist_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setlist_id UUID NOT NULL REFERENCES setlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- for ordering songs in the setlist
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_setlists_event_id ON setlists(event_id);
CREATE INDEX idx_setlist_songs_setlist_id ON setlist_songs(setlist_id);
CREATE INDEX idx_setlist_songs_position ON setlist_songs(position);

-- Set up row level security
ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_songs ENABLE ROW LEVEL SECURITY;

-- Set up security policies for setlists
CREATE POLICY "Band members can view setlists"
ON setlists FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events e
    JOIN band_members bm ON e.band_id = bm.band_id
    WHERE e.id = setlists.event_id 
    AND bm.user_id = auth.uid()
  )
);

CREATE POLICY "Band leaders can manage setlists"
ON setlists FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM events e
    JOIN band_members bm ON e.band_id = bm.band_id
    WHERE e.id = setlists.event_id 
    AND bm.user_id = auth.uid()
    AND bm.role = 'leader'
  )
);

-- Set up security policies for setlist songs
CREATE POLICY "Band members can view setlist songs"
ON setlist_songs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM setlists s
    JOIN events e ON s.event_id = e.id
    JOIN band_members bm ON e.band_id = bm.band_id
    WHERE s.id = setlist_songs.setlist_id
    AND bm.user_id = auth.uid()
  )
);

CREATE POLICY "Band leaders can manage setlist songs"
ON setlist_songs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM setlists s
    JOIN events e ON s.event_id = e.id
    JOIN band_members bm ON e.band_id = bm.band_id
    WHERE s.id = setlist_songs.setlist_id
    AND bm.user_id = auth.uid()
    AND bm.role = 'leader'
  )
);

-- Function to update the updated_at timestamp on setlists
CREATE OR REPLACE FUNCTION update_setlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on setlists
CREATE TRIGGER update_setlist_updated_at_trigger
BEFORE UPDATE ON setlists
FOR EACH ROW
EXECUTE FUNCTION update_setlist_updated_at(); 