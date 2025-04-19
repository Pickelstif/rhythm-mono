-- Create the songs table
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  spotify_link TEXT,
  song_sheet_path TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by band
CREATE INDEX idx_songs_band_id ON songs(band_id);

-- Create the song_sheets storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('song_sheets', 'song_sheets', false);

-- Set up security policies for the bucket
CREATE POLICY "Allow authenticated users to upload song sheets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'song_sheets');

CREATE POLICY "Allow users to download song sheets"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'song_sheets');

CREATE POLICY "Allow band members to delete their song sheets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'song_sheets' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM bands b
    JOIN band_members bm ON b.id = bm.band_id
    WHERE bm.user_id = auth.uid() AND bm.role = 'leader'
  )
);

CREATE POLICY "Allow band members to access songs"
ON songs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM band_members 
    WHERE band_members.band_id = songs.band_id 
    AND band_members.user_id = auth.uid()
  )
);

CREATE POLICY "Allow band leaders to insert songs"
ON songs FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM band_members 
    WHERE band_members.band_id = band_id 
    AND band_members.user_id = auth.uid()
    AND band_members.role = 'leader'
  )
);

CREATE POLICY "Allow band leaders to update songs"
ON songs FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM band_members 
    WHERE band_members.band_id = songs.band_id 
    AND band_members.user_id = auth.uid()
    AND band_members.role = 'leader'
  )
);

CREATE POLICY "Allow band leaders to delete songs"
ON songs FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM band_members 
    WHERE band_members.band_id = songs.band_id 
    AND band_members.user_id = auth.uid()
    AND band_members.role = 'leader'
  )
); 