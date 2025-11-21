-- Update business_goals table to change goal types
-- Remove 'revenue', add 'reservations_served', 'reservations_pending', 'queue_served', 'queue_pending'

-- Drop the old constraint
ALTER TABLE business_goals DROP CONSTRAINT IF EXISTS business_goals_goal_type_check;

-- Add new constraint with updated goal types
ALTER TABLE business_goals ADD CONSTRAINT business_goals_goal_type_check
  CHECK (goal_type IN (
    'attendance',           -- Total attendances (general)
    'avg_time',             -- Average service time
    'reservations_served',  -- Reservations attended
    'reservations_pending', -- Reservations to attend
    'queue_served',         -- Queue entries attended
    'queue_pending'         -- Queue entries to attend
  ));
