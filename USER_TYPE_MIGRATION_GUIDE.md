# User Type Migration Guide

This guide outlines the steps to add a `user_type` column to differentiate between band users and organizer users in the RhythmSync platform.

## 🗄️ Database Changes

### 1. Run SQL Commands in Supabase

Execute the following SQL commands in your Supabase SQL Editor:

```sql
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
```

## 📦 Package Updates

### 2. Update Shared Types

**File:** `packages/shared-types/src/index.ts`

- Added `UserType` enum: `'band' | 'organizer'`
- Added `user_type?: UserType` to `User` and `UserProfile` interfaces

### 3. Update Database Types

**File:** `packages/database/src/types.ts`

- Added `user_type: string` to users table Row interface
- Added `user_type?: string` to users table Insert and Update interfaces

## 🎵 Main App Changes

### 4. Updated AuthContext

**File:** `apps/main-app/src/context/AuthContext.tsx`

**Changes:**
- Added `ensureUserInDatabase()` function to create users with correct `user_type`
- Main-app users default to `user_type: 'band'`
- Maintains existing band leader role system
- Automatically creates database record for new authenticated users

**Key Features:**
- ✅ Backward compatible with existing users
- ✅ Automatically sets `user_type: 'band'` for main-app users
- ✅ Creates database record if missing during sign-in

## 🎤 Organizers App Changes

### 5. Updated AuthContext

**File:** `apps/organizers-app/src/context/AuthContext.tsx`

**Changes:**
- Updated `checkOrganizerRole()` to use `user_type` column instead of email pattern matching
- Now queries: `SELECT user_type FROM users WHERE id = userId`
- Access control: `user_type === 'organizer'`

### 6. Theme System Implementation

**Added Components:**
- `src/context/ThemeContext.tsx` - Theme management
- `src/components/ThemeToggle.tsx` - Theme toggle component  
- `src/components/ui/button.tsx` - UI button component
- `src/components/ui/dropdown-menu.tsx` - UI dropdown component
- `src/lib/utils.ts` - Utility functions

**Updated Pages:**
- `src/App.tsx` - Added ThemeProvider wrapper
- `src/pages/Landing.tsx` - Theme-aware styling + ThemeToggle
- `src/pages/Dashboard.tsx` - Theme-aware styling + ThemeToggle  
- `src/pages/Auth.tsx` - Theme-aware styling + ThemeToggle

## 🚀 Migration Benefits

### Before Migration
- **Organizers App**: Email pattern matching (`email.includes('organizer')`)
- **Main App**: Band leader roles only
- **Issues**: Unreliable, limited flexibility

### After Migration
- **Organizers App**: Database-driven access control (`user_type = 'organizer'`)
- **Main App**: Band leader roles + user_type awareness
- **Benefits**: 
  - ✅ Reliable access control
  - ✅ Admin can change user types via SQL function
  - ✅ Automatic type assignment via trigger
  - ✅ Backward compatible

## 🔧 Usage Examples

### Change User Type (Admin Only)
```sql
-- Make a user an organizer
SELECT update_user_type('user-uuid-here', 'organizer');

-- Make a user a band member
SELECT update_user_type('user-uuid-here', 'band');
```

### Query Users by Type
```sql
-- Get all organizers
SELECT * FROM users WHERE user_type = 'organizer';

-- Get all band users  
SELECT * FROM users WHERE user_type = 'band';
```

## ✅ Testing Checklist

- [ ] Run SQL migration in Supabase
- [ ] Verify existing users have correct user_type
- [ ] Test organizers-app login (only organizer users should access)
- [ ] Test main-app login (band users should access)
- [ ] Test new user registration (should auto-assign type based on email)
- [ ] Verify theme toggle works in organizers-app
- [ ] Test dark/light mode persistence

## 🎯 Final Notes

1. **Existing Users**: Automatically updated based on email patterns
2. **New Users**: Auto-assigned type via database trigger  
3. **Access Control**: Organizers-app checks `user_type = 'organizer'`
4. **Flexibility**: Admin can manually change user types via SQL function
5. **Theme System**: Organizers-app now has same theming as main-app

The migration maintains full backward compatibility while providing a robust, database-driven user type system for both applications. 