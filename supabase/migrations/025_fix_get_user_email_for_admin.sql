-- ============================================================================
-- FIX: get_user_email() to work properly in admin panel
-- Issue: Function raises exception when super admin queries other users
-- Fix: Return NULL on permission denied instead of raising exception
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_email(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
  v_is_super_admin BOOLEAN := false;
  v_current_user_id UUID;
BEGIN
  -- Get current user ID
  v_current_user_id := auth.uid();

  -- If no user authenticated, deny access
  IF v_current_user_id IS NULL THEN
    RETURN 'N/A';
  END IF;

  -- Check if current user is super admin
  SELECT EXISTS (
    SELECT 1 FROM super_admins
    WHERE user_id = v_current_user_id
    AND is_active = true
  ) INTO v_is_super_admin;

  -- SECURITY: Only allow super admins or the user themselves to get email
  IF NOT (p_user_id = v_current_user_id OR v_is_super_admin = true) THEN
    RETURN 'N/A'; -- Access denied
  END IF;

  -- Get email from auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_user_id;

  RETURN COALESCE(v_email, 'Email não encontrado');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant remains the same
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;
