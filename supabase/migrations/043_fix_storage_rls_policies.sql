-- Fix Storage RLS policies for cover-photos and profile-pictures buckets

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('cover-photos', 'cover-photos', true),
  ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload cover photos for their businesses" ON storage.objects;
DROP POLICY IF EXISTS "Users can update cover photos for their businesses" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete cover photos for their businesses" ON storage.objects;
DROP POLICY IF EXISTS "Public can view cover photos" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload profile pictures for their businesses" ON storage.objects;
DROP POLICY IF EXISTS "Users can update profile pictures for their businesses" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete profile pictures for their businesses" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile pictures" ON storage.objects;

-- Cover Photos Policies
CREATE POLICY "Users can upload cover photos for their businesses"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cover-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update cover photos for their businesses"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cover-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete cover photos for their businesses"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cover-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Public can view cover photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cover-photos');

-- Profile Pictures Policies
-- Allow uploads to both user_id folders (for user profiles) and business_id folders (for business profiles)
CREATE POLICY "Users can upload profile pictures for their businesses"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  (
    -- Allow upload to user's own folder
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Allow upload to business folders owned by user
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM businesses WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update profile pictures for their businesses"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' AND
  (
    -- Allow update to user's own folder
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Allow update to business folders owned by user
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM businesses WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete profile pictures for their businesses"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' AND
  (
    -- Allow delete from user's own folder
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Allow delete from business folders owned by user
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM businesses WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Public can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');
