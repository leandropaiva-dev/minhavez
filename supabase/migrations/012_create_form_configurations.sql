-- Create form configurations table
CREATE TABLE IF NOT EXISTS form_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL CHECK (form_type IN ('queue', 'reservation')),

  -- Service selection settings
  enable_service_selection BOOLEAN DEFAULT FALSE,
  service_selection_required BOOLEAN DEFAULT FALSE,

  -- Services (JSONB array)
  services JSONB DEFAULT '[]'::jsonb,

  -- Field configuration
  fields JSONB NOT NULL DEFAULT '{
    "phone": {"enabled": true, "required": true},
    "email": {"enabled": true, "required": false},
    "partySize": {"enabled": true, "required": false},
    "notes": {"enabled": true, "required": false}
  }'::jsonb,

  -- Custom fields (JSONB array)
  custom_fields JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one config per business per form type
  UNIQUE(business_id, form_type)
);

-- Create indexes
CREATE INDEX idx_form_configurations_business_id ON form_configurations(business_id);
CREATE INDEX idx_form_configurations_form_type ON form_configurations(form_type);

-- Enable Row Level Security
ALTER TABLE form_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view configs for their own business
CREATE POLICY "Users can view their own form configurations"
  ON form_configurations FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Users can insert configs for their own business
CREATE POLICY "Users can create their own form configurations"
  ON form_configurations FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Users can update configs for their own business
CREATE POLICY "Users can update their own form configurations"
  ON form_configurations FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Users can delete configs for their own business
CREATE POLICY "Users can delete their own form configurations"
  ON form_configurations FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Public read access for form configurations (so public forms can read them)
CREATE POLICY "Public can view form configurations"
  ON form_configurations FOR SELECT
  USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_form_configurations_updated_at
  BEFORE UPDATE ON form_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
