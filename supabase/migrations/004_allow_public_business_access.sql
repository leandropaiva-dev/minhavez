-- Allow anyone to view business information (for public queue pages)
-- This allows customers to see business details when joining the queue
CREATE POLICY "Anyone can view business info for queue"
  ON public.businesses
  FOR SELECT
  USING (true);

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own business" ON public.businesses;

-- Re-create a policy for authenticated users to view their own business
-- This is redundant now but kept for clarity
CREATE POLICY "Users can view their own business"
  ON public.businesses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
