-- =====================================================
-- MIGRATION 040: Adicionar customização visual do negócio
-- Data: 2025-01-31
-- Descrição: Foto de capa e toggles de informações de contato
-- OBS: phone, address e profile_picture_url já existem
-- =====================================================

-- 1. Adicionar apenas colunas novas de customização
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_instagram BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_website BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_address BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Comentários para documentação
COMMENT ON COLUMN businesses.cover_photo_url IS 'URL da foto de capa do negócio (banner)';
COMMENT ON COLUMN businesses.profile_picture_url IS 'URL da foto de perfil do negócio (avatar) - já existia';
COMMENT ON COLUMN businesses.show_phone IS 'Exibir telefone nas páginas públicas';
COMMENT ON COLUMN businesses.show_email IS 'Exibir email nas páginas públicas';
COMMENT ON COLUMN businesses.show_instagram IS 'Exibir Instagram nas páginas públicas';
COMMENT ON COLUMN businesses.show_website IS 'Exibir website nas páginas públicas';
COMMENT ON COLUMN businesses.show_address IS 'Exibir endereço nas páginas públicas';
COMMENT ON COLUMN businesses.instagram_url IS 'URL do Instagram do negócio';
COMMENT ON COLUMN businesses.website_url IS 'URL do website do negócio';
COMMENT ON COLUMN businesses.email IS 'Email de contato do negócio';
COMMENT ON COLUMN businesses.phone IS 'Telefone do negócio - já existia';
COMMENT ON COLUMN businesses.address IS 'Endereço completo do negócio - já existia';
