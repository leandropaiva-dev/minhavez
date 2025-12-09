-- Create service-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload service images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their service images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'service-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their service images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'service-images');

-- Allow public read access
CREATE POLICY "Public can view service images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'service-images');
