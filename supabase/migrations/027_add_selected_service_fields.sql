-- Add selected_service column to queue_entries table
ALTER TABLE queue_entries
ADD COLUMN IF NOT EXISTS selected_service TEXT;

-- Add selected_service column to reservations table
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS selected_service TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN queue_entries.selected_service IS 'ID of the service selected by the customer when joining the queue';
COMMENT ON COLUMN reservations.selected_service IS 'ID of the service selected by the customer when making a reservation';
