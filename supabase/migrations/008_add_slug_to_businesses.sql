-- Add slug column to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);

-- Function to generate slug from business name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT) RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  -- Check if slug exists, if so, append number
  WHILE EXISTS (SELECT 1 FROM businesses WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing businesses with slugs
UPDATE businesses SET slug = generate_slug(name) WHERE slug IS NULL;

-- Make slug NOT NULL after populating existing records
ALTER TABLE businesses ALTER COLUMN slug SET NOT NULL;

-- Update policy to allow public access to business info by slug
CREATE POLICY "Anyone can view business by slug"
  ON businesses FOR SELECT
  USING (slug IS NOT NULL);
