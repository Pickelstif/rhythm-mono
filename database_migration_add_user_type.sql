-- Add user_type column to users table
-- Run these commands in Supabase SQL Editor

-- 1. Add the user_type column with enum constraint
ALTER TABLE public.users 
ADD COLUMN user_type text NOT NULL DEFAULT 'band' 
CHECK (user_type IN ('band', 'organizer'));

-- 2. Create an index for better query performance
CREATE INDEX idx_users_user_type ON public.users(user_type);

-- 3. Update existing users based on current email logic
-- Set users with 'organizer' or 'admin' in email to be organizers
UPDATE public.users 
SET user_type = 'organizer' 
WHERE LOWER(email) LIKE '%organizer%' OR LOWER(email) LIKE '%admin%';

-- 4. Add a function to automatically set user_type when inserting new users
CREATE OR REPLACE FUNCTION set_user_type_from_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign organizer type if email contains organizer or admin
  IF LOWER(NEW.email) LIKE '%organizer%' OR LOWER(NEW.email) LIKE '%admin%' THEN
    NEW.user_type := 'organizer';
  ELSE
    NEW.user_type := 'band';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to run the function before insert
CREATE TRIGGER trigger_set_user_type_from_email
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_type_from_email();

-- 6. Optional: Create a function to change user type (for admin use)
CREATE OR REPLACE FUNCTION update_user_type(user_id uuid, new_type text)
RETURNS void AS $$
BEGIN
  IF new_type NOT IN ('band', 'organizer') THEN
    RAISE EXCEPTION 'Invalid user_type. Must be either "band" or "organizer"';
  END IF;
  
  UPDATE public.users 
  SET user_type = new_type 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Verification query (optional - run to check results)
-- SELECT id, email, user_type FROM public.users ORDER BY user_type, email; 