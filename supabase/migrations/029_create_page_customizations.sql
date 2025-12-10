-- Create page_customizations table
CREATE TABLE IF NOT EXISTS page_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  page_type VARCHAR(50) NOT NULL, -- 'queue_form', 'queue_wait', 'queue_attending', 'queue_completed', 'reservation_form', 'reservation_confirm'

  -- Background
  background_type VARCHAR(20) DEFAULT 'solid', -- 'solid', 'gradient', 'image'
  background_color VARCHAR(20) DEFAULT '#000000',
  background_gradient_start VARCHAR(20),
  background_gradient_end VARCHAR(20),
  background_gradient_direction VARCHAR(50) DEFAULT 'to bottom',
  background_image_url TEXT,
  background_image_size VARCHAR(20) DEFAULT 'cover', -- 'cover', 'repeat'

  -- Colors
  text_color VARCHAR(20) DEFAULT '#ffffff',
  primary_color VARCHAR(20) DEFAULT '#3b82f6',
  button_color VARCHAR(20) DEFAULT '#3b82f6',
  button_text_color VARCHAR(20) DEFAULT '#ffffff',
  card_background VARCHAR(20) DEFAULT '#18181b',
  card_border_color VARCHAR(20) DEFAULT '#27272a',

  -- Styles
  button_style VARCHAR(20) DEFAULT 'rounded', -- 'rounded', 'pill', 'square'
  card_border_radius VARCHAR(10) DEFAULT 'xl', -- 'sm', 'md', 'lg', 'xl', '2xl'

  -- Branding
  logo_url TEXT,
  show_business_name BOOLEAN DEFAULT true,
  show_powered_by BOOLEAN DEFAULT true,
  custom_title TEXT,
  custom_subtitle TEXT,

  -- Post-completion customizations (for queue_completed and reservation_confirm)
  thank_you_message TEXT,
  review_link TEXT,
  review_button_text TEXT,
  cta_link TEXT,
  cta_button_text TEXT,
  cta_icon VARCHAR(20),
  auto_redirect_enabled BOOLEAN DEFAULT false,
  auto_redirect_url TEXT,
  auto_redirect_delay INTEGER DEFAULT 5,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique combination of business + page_type
  UNIQUE(business_id, page_type)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_page_customizations_business_id ON page_customizations(business_id);
CREATE INDEX IF NOT EXISTS idx_page_customizations_page_type ON page_customizations(page_type);
CREATE INDEX IF NOT EXISTS idx_page_customizations_business_page ON page_customizations(business_id, page_type);

-- Enable RLS
ALTER TABLE page_customizations ENABLE ROW LEVEL SECURITY;

-- Policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view page customizations" ON page_customizations;
DROP POLICY IF EXISTS "Authenticated users can view customizations" ON page_customizations;
DROP POLICY IF EXISTS "Users can insert their own page customizations" ON page_customizations;
DROP POLICY IF EXISTS "Users can update their own page customizations" ON page_customizations;
DROP POLICY IF EXISTS "Users can delete their own page customizations" ON page_customizations;
DROP POLICY IF EXISTS "Super admins can manage all customizations" ON page_customizations;

-- Create policies
-- Public can view customizations (needed for public pages)
CREATE POLICY "Public can view page customizations"
  ON page_customizations FOR SELECT
  TO public
  USING (true);

-- Authenticated users can view all customizations
CREATE POLICY "Authenticated users can view customizations"
  ON page_customizations FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own customizations
CREATE POLICY "Users can insert their own page customizations"
  ON page_customizations FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Users can update their own customizations
CREATE POLICY "Users can update their own page customizations"
  ON page_customizations FOR UPDATE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own customizations
CREATE POLICY "Users can delete their own page customizations"
  ON page_customizations FOR DELETE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Super admins can do everything
CREATE POLICY "Super admins can manage all customizations"
  ON page_customizations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
