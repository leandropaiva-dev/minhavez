-- =====================================================
-- MIGRATION 041: Criar bucket para fotos de capa
-- Data: 2025-01-31
-- OBS: Bucket 'profile-pictures' já existe (migration 013)
-- =====================================================

-- 1. Criar bucket 'cover-photos' (público para leitura)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cover-photos', 'cover-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para UPLOAD (apenas donos do negócio)
CREATE POLICY "Users can upload cover photos for their business"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cover-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE user_id = auth.uid()
  )
);

-- 3. Política para UPDATE (apenas donos do negócio)
CREATE POLICY "Users can update cover photos for their business"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cover-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE user_id = auth.uid()
  )
);

-- 4. Política para DELETE (apenas donos do negócio)
CREATE POLICY "Users can delete cover photos for their business"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'cover-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE user_id = auth.uid()
  )
);

-- 5. Política para SELECT (público - qualquer um pode ver)
CREATE POLICY "Anyone can view cover photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'cover-photos');

-- Estrutura de pastas:
-- cover-photos/{business_id}/cover.jpg
-- profile-pictures/{user_id}/profile.jpg (já existe)
