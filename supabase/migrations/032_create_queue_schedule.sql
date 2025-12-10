-- Create queue_schedule table for configuring queue operating hours
CREATE TABLE IF NOT EXISTS queue_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Note: Overlap validation will be handled by application logic
  -- to avoid IMMUTABLE function requirements in constraints
  CONSTRAINT unique_business_day_time UNIQUE(business_id, day_of_week, start_time, end_time)
);

-- Create index for faster queries
CREATE INDEX idx_queue_schedule_business ON queue_schedule(business_id);
CREATE INDEX idx_queue_schedule_active ON queue_schedule(business_id, is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE queue_schedule ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own business schedules
CREATE POLICY "Users can view own queue schedule"
  ON queue_schedule FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert schedules for their businesses
CREATE POLICY "Users can insert own queue schedule"
  ON queue_schedule FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update their own business schedules
CREATE POLICY "Users can update own queue schedule"
  ON queue_schedule FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete their own business schedules
CREATE POLICY "Users can delete own queue schedule"
  ON queue_schedule FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Super admin can view all schedules
CREATE POLICY "Super admin can view all queue schedules"
  ON queue_schedule FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Public can view schedules (needed for checking if queue is open)
CREATE POLICY "Public can view queue schedules"
  ON queue_schedule FOR SELECT
  TO public, anon
  USING (true);

-- Function to check if queue is open for a specific datetime
CREATE OR REPLACE FUNCTION is_queue_time_open(
  p_business_id UUID,
  p_datetime TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
DECLARE
  v_day_of_week INTEGER;
  v_time TIME;
  v_count INTEGER;
BEGIN
  -- Extract day of week (0 = Sunday) and time from the datetime
  v_day_of_week := EXTRACT(DOW FROM p_datetime)::INTEGER;
  v_time := p_datetime::TIME;

  -- Check if there's an active schedule for this day and time
  SELECT COUNT(*) INTO v_count
  FROM queue_schedule
  WHERE business_id = p_business_id
    AND day_of_week = v_day_of_week
    AND start_time <= v_time
    AND end_time >= v_time
    AND is_active = true;

  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for queue_schedule
ALTER PUBLICATION supabase_realtime ADD TABLE queue_schedule;
