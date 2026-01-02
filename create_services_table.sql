-- =====================================================
-- MIGRATION: Criar tabela unificada de serviços
-- Data: 2025-01-31
-- Descrição: Centraliza gerenciamento de serviços para fila e reservas
-- =====================================================

-- 1. Criar tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Informações básicas
  name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT NOT NULL, -- FOTO OBRIGATÓRIA!
  
  -- Disponibilidade
  is_active BOOLEAN DEFAULT true,
  available_in_queue BOOLEAN DEFAULT true,
  available_in_reservations BOOLEAN DEFAULT true,
  
  -- Detalhes operacionais
  estimated_duration_minutes INTEGER, -- Ex: 30 min para corte
  price_cents INTEGER, -- Preço em centavos (ex: 5000 = R$ 50,00)
  
  -- Ordenação
  position INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_services_business_id ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_queue ON services(business_id, available_in_queue) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_reservations ON services(business_id, available_in_reservations) WHERE is_active = true;

-- 3. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_services_updated_at();

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas de segurança
-- Política para SELECT: usuário pode ver serviços do próprio negócio
CREATE POLICY "Users can view their own business services"
  ON services
  FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Política para INSERT: usuário pode criar serviços para próprio negócio
CREATE POLICY "Users can create services for their business"
  ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Política para UPDATE: usuário pode atualizar serviços do próprio negócio
CREATE POLICY "Users can update their own business services"
  ON services
  FOR UPDATE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Política para DELETE: usuário pode deletar serviços do próprio negócio
CREATE POLICY "Users can delete their own business services"
  ON services
  FOR DELETE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 6. Comentários para documentação
COMMENT ON TABLE services IS 'Serviços oferecidos pelos negócios (usado em fila e reservas)';
COMMENT ON COLUMN services.photo_url IS 'URL da foto do serviço no Supabase Storage - OBRIGATÓRIO';
COMMENT ON COLUMN services.price_cents IS 'Preço em centavos (ex: 5000 = R$ 50,00)';
COMMENT ON COLUMN services.estimated_duration_minutes IS 'Duração estimada em minutos';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

-- Execute este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/[PROJECT_ID]/editor
