-- Add tutorial_completed column to auth.users metadata
-- Since we can't directly modify auth.users, we'll use user_metadata

-- This migration is informational only
-- The tutorial_completed status will be stored in user_metadata via Supabase client
-- We don't need to create a separate table as auth.users.user_metadata is flexible

-- Example of how it's used:
-- await supabase.auth.updateUser({
--   data: { tutorial_completed: true }
-- })

-- No SQL changes needed as we're using user_metadata
