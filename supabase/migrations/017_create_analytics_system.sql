-- Create analytics_events table for tracking all interactions
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL, -- page_view, form_submit, queue_join, reservation_create, link_click, etc
  event_category TEXT NOT NULL, -- navigation, conversion, engagement
  page_path TEXT, -- /slug/fila, /slug/reserva, /slug/links

  -- User info
  session_id TEXT,
  visitor_id TEXT, -- Anonymous visitor tracking
  user_agent TEXT,
  ip_address INET,

  -- Location data
  country TEXT,
  city TEXT,
  referrer TEXT,

  -- Device info
  device_type TEXT, -- mobile, desktop, tablet
  browser TEXT,
  os TEXT,

  -- Additional data
  metadata JSONB, -- Extra event-specific data

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_business ON analytics_events(business_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_business_created ON analytics_events(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_page_path ON analytics_events(page_path);

-- RLS policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Business owners can read their analytics
CREATE POLICY "Business owners can read analytics"
ON analytics_events FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  )
);

-- Super admins can read all analytics
CREATE POLICY "Super admins can read all analytics"
ON analytics_events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM super_admins sa
    WHERE sa.user_id = auth.uid()
  )
);

-- Anyone can insert analytics (for public forms)
CREATE POLICY "Anyone can insert analytics"
ON analytics_events FOR INSERT
WITH CHECK (true);

-- Function to track analytics event
CREATE OR REPLACE FUNCTION track_analytics_event(
  p_business_id UUID,
  p_event_type TEXT,
  p_event_category TEXT,
  p_page_path TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_visitor_id TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO analytics_events (
    business_id,
    event_type,
    event_category,
    page_path,
    session_id,
    visitor_id,
    user_agent,
    ip_address,
    referrer,
    device_type,
    metadata
  )
  VALUES (
    p_business_id,
    p_event_type,
    p_event_category,
    p_page_path,
    p_session_id,
    p_visitor_id,
    p_user_agent,
    p_ip_address,
    p_referrer,
    p_device_type,
    p_metadata
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION track_analytics_event(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INET, TEXT, TEXT, JSONB) TO anon, authenticated;

-- Create materialized view for daily analytics summary (for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_daily_summary AS
SELECT
  business_id,
  DATE(created_at) as date,
  event_type,
  page_path,
  COUNT(*) as event_count,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events
GROUP BY business_id, DATE(created_at), event_type, page_path;

CREATE INDEX IF NOT EXISTS idx_analytics_daily_business_date
ON analytics_daily_summary(business_id, date DESC);

-- Function to refresh analytics summary (call this daily via cron)
CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_daily_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create conversion funnel tracking
CREATE TABLE IF NOT EXISTS conversion_funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,

  -- Funnel steps
  viewed_page BOOLEAN DEFAULT false,
  viewed_page_at TIMESTAMPTZ,

  started_form BOOLEAN DEFAULT false,
  started_form_at TIMESTAMPTZ,

  submitted_form BOOLEAN DEFAULT false,
  submitted_form_at TIMESTAMPTZ,

  -- Form type
  form_type TEXT, -- queue, reservation, link

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id, visitor_id, session_id, form_type)
);

CREATE INDEX IF NOT EXISTS idx_conversion_business ON conversion_funnels(business_id);
CREATE INDEX IF NOT EXISTS idx_conversion_created ON conversion_funnels(created_at DESC);

-- RLS for conversion funnels
ALTER TABLE conversion_funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can read conversion funnels"
ON conversion_funnels FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Super admins can read all conversion funnels"
ON conversion_funnels FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM super_admins sa
    WHERE sa.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can insert/update conversion funnels"
ON conversion_funnels FOR ALL
WITH CHECK (true);
