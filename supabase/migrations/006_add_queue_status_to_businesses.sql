-- Add is_queue_open column to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_queue_open BOOLEAN DEFAULT true;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_businesses_queue_open ON businesses(is_queue_open);

-- Add comment
COMMENT ON COLUMN businesses.is_queue_open IS 'Indicates whether the queue is currently accepting new entries';
