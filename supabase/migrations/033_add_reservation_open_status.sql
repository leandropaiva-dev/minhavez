-- Add is_reservation_open field to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS is_reservation_open BOOLEAN DEFAULT true;

-- Update existing businesses to have reservations open by default
UPDATE businesses
SET is_reservation_open = true
WHERE is_reservation_open IS NULL;
