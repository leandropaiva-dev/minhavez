-- ============================================================================
-- SECURITY: Storage validation improvements
-- Add size limits to profile pictures bucket
-- ============================================================================

-- Update bucket with file size limit (5MB)
UPDATE storage.buckets
SET file_size_limit = 5242880,  -- 5MB in bytes
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE id = 'profile-pictures';

-- Note: MIME type validation is enforced client-side via the validation library
-- Server-side validation happens through the allowed_mime_types constraint above
