-- Add cancellation_reason field to queue_entries
ALTER TABLE public.queue_entries
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add cancellation_reason field to reservations
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.queue_entries.cancellation_reason IS 'Reason for cancellation when status is cancelled or no_show';
COMMENT ON COLUMN public.reservations.cancellation_reason IS 'Reason for cancellation when status is cancelled or no_show';
