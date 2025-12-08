-- Create user_activity table to track logins and actions
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_business ON user_activity(business_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity(created_at DESC);

-- RLS policies
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Super admins can read all activity
CREATE POLICY "Super admins can read all activity"
ON user_activity FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM super_admins sa
    WHERE sa.user_id = auth.uid()
  )
);

-- Users can read their own activity
CREATE POLICY "Users can read their own activity"
ON user_activity FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create business_metrics table for daily/weekly/monthly stats
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),

  -- Queue metrics
  total_queue_entries INTEGER DEFAULT 0,
  avg_wait_time_minutes INTEGER DEFAULT 0,

  -- Reservation metrics
  total_reservations INTEGER DEFAULT 0,
  confirmed_reservations INTEGER DEFAULT 0,
  canceled_reservations INTEGER DEFAULT 0,

  -- User metrics
  unique_visitors INTEGER DEFAULT 0,
  returning_visitors INTEGER DEFAULT 0,

  -- Revenue (if applicable)
  total_revenue NUMERIC(10, 2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id, metric_date, period_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_metrics_business ON business_metrics(business_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_date ON business_metrics(metric_date DESC);

-- RLS
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;

-- Super admins can read all metrics
CREATE POLICY "Super admins can read all metrics"
ON business_metrics FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM super_admins sa
    WHERE sa.user_id = auth.uid()
  )
);

-- Business owners can read their own metrics
CREATE POLICY "Business owners can read their metrics"
ON business_metrics FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  )
);

-- Function to get user's last activity
CREATE OR REPLACE FUNCTION get_user_last_activity(p_user_id UUID)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_last_activity TIMESTAMPTZ;
BEGIN
  SELECT MAX(created_at) INTO v_last_activity
  FROM user_activity
  WHERE user_id = p_user_id;

  RETURN v_last_activity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_last_activity(UUID) TO authenticated;

-- Function to log user activity (called from app)
CREATE OR REPLACE FUNCTION log_user_activity(
  p_activity_type TEXT,
  p_business_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO user_activity (
    user_id,
    business_id,
    activity_type,
    details,
    ip_address,
    user_agent
  )
  VALUES (
    auth.uid(),
    p_business_id,
    p_activity_type,
    p_details,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION log_user_activity(TEXT, UUID, JSONB, INET, TEXT) TO authenticated;
