-- Add reservation configuration to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS reservation_requires_professional BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reservation_requires_payment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reservation_collect_customer_info_first BOOLEAN DEFAULT true;

-- Add professionals/units table
CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add service-professional relationship (many-to-many)
CREATE TABLE IF NOT EXISTS service_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, professional_id)
);

-- RLS for professionals
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public can view active professionals"
    ON professionals FOR SELECT
    USING (is_active = true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Business owners can manage their professionals"
    ON professionals FOR ALL
    USING (
      business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- RLS for service_professionals
ALTER TABLE service_professionals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public can view service professionals"
    ON service_professionals FOR SELECT
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Business owners can manage service professionals"
    ON service_professionals FOR ALL
    USING (
      service_id IN (
        SELECT s.id FROM services s
        JOIN businesses b ON s.business_id = b.id
        WHERE b.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_professionals_business ON professionals(business_id);
CREATE INDEX IF NOT EXISTS idx_service_professionals_service ON service_professionals(service_id);
CREATE INDEX IF NOT EXISTS idx_service_professionals_professional ON service_professionals(professional_id);

-- Update trigger
DO $$ BEGIN
  CREATE TRIGGER update_professionals_updated_at
    BEFORE UPDATE ON professionals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
