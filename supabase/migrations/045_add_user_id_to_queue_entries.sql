-- Add user_id to queue_entries to enable push notifications

ALTER TABLE public.queue_entries
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_queue_entries_user_id ON public.queue_entries(user_id);

-- Update RLS policy to allow users to view their own queue entries
CREATE POLICY "Users can view their own queue entries"
  ON public.queue_entries
  FOR SELECT
  USING (auth.uid() = user_id);
