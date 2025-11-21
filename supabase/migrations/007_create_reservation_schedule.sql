-- Create reservation_schedule table for configuring business hours
CREATE TABLE IF NOT EXISTS reservation_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no overlapping time slots for same business and day
  CONSTRAINT no_overlap EXCLUDE USING gist (
    business_id WITH =,
    day_of_week WITH =,
    tsrange(
      ('2000-01-01 ' || start_time::text)::timestamp,
      ('2000-01-01 ' || end_time::text)::timestamp
    ) WITH &&
  ) WHERE (is_active = true)
);

-- Create index for faster queries
CREATE INDEX idx_reservation_schedule_business ON reservation_schedule(business_id);
CREATE INDEX idx_reservation_schedule_active ON reservation_schedule(business_id, is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE reservation_schedule ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own business schedules
CREATE POLICY "Users can view own business schedule"
  ON reservation_schedule
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can insert schedules for their businesses
CREATE POLICY "Users can insert own business schedule"
  ON reservation_schedule
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can update their own business schedules
CREATE POLICY "Users can update own business schedule"
  ON reservation_schedule
  FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can delete their own business schedules
CREATE POLICY "Users can delete own business schedule"
  ON reservation_schedule
  FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Function to check if reservations are open for a specific datetime
CREATE OR REPLACE FUNCTION is_reservation_time_open(
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
  FROM reservation_schedule
  WHERE business_id = p_business_id
    AND day_of_week = v_day_of_week
    AND start_time <= v_time
    AND end_time >= v_time
    AND is_active = true;

  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for reservation_schedule
ALTER PUBLICATION supabase_realtime ADD TABLE reservation_schedule;
