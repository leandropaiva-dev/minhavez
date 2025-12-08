-- ============================================================================
-- ENSURE is_active column exists in super_admins table
-- ============================================================================

-- Add is_active column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'super_admins'
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE super_admins ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Update any existing records to have is_active = true
UPDATE super_admins
SET is_active = true
WHERE is_active IS NULL;

-- Add NOT NULL constraint after updating nulls
ALTER TABLE super_admins
ALTER COLUMN is_active SET DEFAULT TRUE,
ALTER COLUMN is_active SET NOT NULL;
