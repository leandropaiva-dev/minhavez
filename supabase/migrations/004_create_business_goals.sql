-- Create business_goals table
CREATE TABLE IF NOT EXISTS business_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('attendance', 'avg_time', 'reservations', 'revenue')),
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, goal_type, period_type, start_date)
);

-- Create indexes
CREATE INDEX idx_business_goals_business_id ON business_goals(business_id);
CREATE INDEX idx_business_goals_period ON business_goals(period_type);
CREATE INDEX idx_business_goals_active ON business_goals(is_active);
CREATE INDEX idx_business_goals_dates ON business_goals(start_date, end_date);

-- Enable RLS
ALTER TABLE business_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view goals for their business"
  ON business_goals FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert goals for their business"
  ON business_goals FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update goals for their business"
  ON business_goals FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete goals for their business"
  ON business_goals FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_goals_updated_at
  BEFORE UPDATE ON business_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_business_goals_updated_at();

-- Function to calculate goal dates based on period
CREATE OR REPLACE FUNCTION calculate_goal_dates(
  p_period_type TEXT,
  p_start_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(start_date DATE, end_date DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_start_date,
    CASE
      WHEN p_period_type = 'daily' THEN p_start_date
      WHEN p_period_type = 'weekly' THEN p_start_date + INTERVAL '6 days'
      WHEN p_period_type = 'monthly' THEN p_start_date + INTERVAL '1 month' - INTERVAL '1 day'
      WHEN p_period_type = 'quarterly' THEN p_start_date + INTERVAL '3 months' - INTERVAL '1 day'
      WHEN p_period_type = 'biannual' THEN p_start_date + INTERVAL '6 months' - INTERVAL '1 day'
      WHEN p_period_type = 'annual' THEN p_start_date + INTERVAL '1 year' - INTERVAL '1 day'
    END::DATE;
END;
$$ LANGUAGE plpgsql;
