-- Add service configuration fields to businesses table
-- Migration 035: Support for average service time and service mode

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS avg_service_time INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS service_mode TEXT DEFAULT 'queue';

-- Add check constraint for service_mode
ALTER TABLE businesses
  ADD CONSTRAINT service_mode_check CHECK (
    service_mode IN ('queue', 'reservation', 'both')
  );

-- Add comment for documentation
COMMENT ON COLUMN businesses.avg_service_time IS 'Average service time in minutes';
COMMENT ON COLUMN businesses.service_mode IS 'Service mode: queue, reservation, or both';
