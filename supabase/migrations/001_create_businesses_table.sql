-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT,
  phone TEXT,
  address TEXT,

  -- Subscription info
  subscription_status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT business_type_check CHECK (
    business_type IN ('restaurante', 'bar', 'clinica', 'barbearia', 'outro')
  ),
  CONSTRAINT subscription_status_check CHECK (
    subscription_status IN ('trial', 'active', 'canceled', 'past_due')
  )
);

-- Create index for faster queries
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_subscription_status ON businesses(subscription_status);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own business
CREATE POLICY "Users can view their own business"
  ON businesses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own business (only if they don't have one yet)
CREATE POLICY "Users can create their own business"
  ON businesses FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Users can update their own business
CREATE POLICY "Users can update their own business"
  ON businesses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own business
CREATE POLICY "Users can delete their own business"
  ON businesses FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on businesses table
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a view for business with user info (useful for admin/dashboard)
CREATE OR REPLACE VIEW businesses_with_users AS
SELECT
  b.*,
  u.email,
  u.raw_user_meta_data->>'name' as owner_name
FROM businesses b
LEFT JOIN auth.users u ON b.user_id = u.id;
