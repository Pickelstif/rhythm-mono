-- Add unique constraint to band names
-- Run these commands in Supabase SQL Editor

-- 1. First, check for and handle any existing duplicate band names
-- This query will show you any duplicates that need to be addressed manually
-- SELECT name, COUNT(*) as count 
-- FROM public.bands 
-- GROUP BY name 
-- HAVING COUNT(*) > 1;

-- 2. Optional: If there are duplicates, you may want to rename them first
-- Example: UPDATE public.bands SET name = name || ' (duplicate)' WHERE id IN (
--   SELECT id FROM (
--     SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at DESC) as rn
--     FROM public.bands
--   ) t WHERE rn > 1
-- );

-- 3. Add the unique constraint to the name column
ALTER TABLE public.bands 
ADD CONSTRAINT bands_name_unique UNIQUE (name);

-- 4. Create an index for better query performance on band name lookups
CREATE INDEX IF NOT EXISTS idx_bands_name ON public.bands(name);

-- 5. Add a function to check if band name exists (optional - for application use)
CREATE OR REPLACE FUNCTION check_band_name_exists(band_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.bands 
    WHERE LOWER(name) = LOWER(band_name)
  );
END;
$$ LANGUAGE plpgsql;

-- Verification queries (optional - run to check results)
-- Check constraint was added:
-- SELECT constraint_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'bands' AND constraint_type = 'UNIQUE';

-- Test the function:
-- SELECT check_band_name_exists('Test Band Name'); 