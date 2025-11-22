-- Link Pages (Agregador de Links estilo Linktree)
CREATE TABLE IF NOT EXISTS link_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Configurações básicas
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200),
  bio TEXT,

  -- Imagens
  avatar_url TEXT,
  cover_url TEXT,

  -- Estilo do fundo
  background_type VARCHAR(20) DEFAULT 'solid', -- 'solid', 'gradient', 'image'
  background_color VARCHAR(20) DEFAULT '#000000',
  background_gradient_start VARCHAR(20),
  background_gradient_end VARCHAR(20),
  background_gradient_direction VARCHAR(20) DEFAULT 'to bottom', -- 'to bottom', 'to right', 'to bottom right'
  background_image_url TEXT,

  -- Estilo dos botões
  button_style VARCHAR(20) DEFAULT 'rounded', -- 'rounded', 'pill', 'square'
  button_color VARCHAR(20) DEFAULT '#3b82f6',
  button_text_color VARCHAR(20) DEFAULT '#ffffff',

  -- Estilo do texto
  text_color VARCHAR(20) DEFAULT '#ffffff',

  -- Social links
  social_links JSONB DEFAULT '{}',

  -- SEO
  seo_title VARCHAR(200),
  seo_description TEXT,

  -- Status
  is_published BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Links individuais
CREATE TABLE IF NOT EXISTS link_page_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_page_id UUID NOT NULL REFERENCES link_pages(id) ON DELETE CASCADE,

  title VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(50), -- nome do ícone ou emoji

  -- Tipo especial (integração com MinhaVez)
  link_type VARCHAR(20) DEFAULT 'custom', -- 'custom', 'queue', 'reservation', 'whatsapp', 'instagram', 'menu', 'location'

  -- Estilo individual (opcional, sobrescreve o padrão)
  custom_color VARCHAR(20),
  custom_text_color VARCHAR(20),

  -- Thumbnail/imagem
  thumbnail_url TEXT,

  -- Ordem e visibilidade
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Analytics
  click_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_link_pages_business_id ON link_pages(business_id);
CREATE INDEX IF NOT EXISTS idx_link_pages_slug ON link_pages(slug);
CREATE INDEX IF NOT EXISTS idx_link_page_links_page_id ON link_page_links(link_page_id);
CREATE INDEX IF NOT EXISTS idx_link_page_links_position ON link_page_links(link_page_id, position);

-- RLS
ALTER TABLE link_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_page_links ENABLE ROW LEVEL SECURITY;

-- Policies para link_pages
CREATE POLICY "Public can view published link pages"
  ON link_pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can manage their own link pages"
  ON link_pages FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Policies para link_page_links
CREATE POLICY "Public can view active links"
  ON link_page_links FOR SELECT
  USING (
    is_active = true AND
    link_page_id IN (SELECT id FROM link_pages WHERE is_published = true)
  );

CREATE POLICY "Users can manage their own links"
  ON link_page_links FOR ALL
  USING (
    link_page_id IN (
      SELECT lp.id FROM link_pages lp
      JOIN businesses b ON lp.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

-- Função para incrementar cliques
CREATE OR REPLACE FUNCTION increment_link_click(p_link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE link_page_links
  SET click_count = click_count + 1
  WHERE id = p_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
