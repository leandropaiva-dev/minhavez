-- Add segment field to businesses table
-- Migration 036: Support for business segment

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS segment TEXT;

-- Add check constraint for segment
ALTER TABLE businesses
  ADD CONSTRAINT segment_check CHECK (
    segment IN ('health', 'food', 'beauty')
  );

-- Add comment for documentation
COMMENT ON COLUMN businesses.segment IS 'Business segment: health, food, or beauty';
