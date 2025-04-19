-- Make the song_sheets bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'song_sheets';

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to download song sheets" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view song sheets for their bands" ON storage.objects;

-- Create a policy for public download access
CREATE POLICY "Allow public access to song sheets"
ON storage.objects FOR SELECT
USING (bucket_id = 'song_sheets');

-- Keep the upload policy for authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to upload song sheets" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload song sheets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'song_sheets');

-- Set policy for deletion (only band leaders)
DROP POLICY IF EXISTS "Allow band members to delete their song sheets" ON storage.objects;
CREATE POLICY "Allow band leaders to delete their song sheets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'song_sheets' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.bands b
    JOIN public.band_members bm ON b.id = bm.band_id
    WHERE bm.user_id = auth.uid() AND bm.role = 'leader'
  )
); 