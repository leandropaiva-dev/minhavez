-- =====================================================
-- MIGRATION 039: Criar bucket para fotos de serviços
-- Data: 2025-01-31
-- =====================================================

-- 1. Criar bucket 'service-photos' (público para leitura)
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-photos', 'service-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para UPLOAD (apenas donos do negócio)
CREATE POLICY "Users can upload service photos for their business"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'service-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE user_id = auth.uid()
  )
);

-- 3. Política para UPDATE (apenas donos do negócio)
CREATE POLICY "Users can update service photos for their business"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE user_id = auth.uid()
  )
);

-- 4. Política para DELETE (apenas donos do negócio)
CREATE POLICY "Users can delete service photos for their business"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE user_id = auth.uid()
  )
);

-- 5. Política para SELECT (público - qualquer um pode ver)
CREATE POLICY "Anyone can view service photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'service-photos');

-- Estrutura de pastas: service-photos/{business_id}/{service_id}.jpg
