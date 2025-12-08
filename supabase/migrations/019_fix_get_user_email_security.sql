-- ============================================================================
-- FIX CRITICAL: get_user_email() Function Security
-- Issue: Any authenticated user can query email of ANY user (enumeration)
-- Impact: Privacy violation, user enumeration attack
-- ============================================================================

-- Replace the insecure function with validation
CREATE OR REPLACE FUNCTION get_user_email(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- SECURITY: Only allow super admins or the user themselves to get email
  IF NOT (
    p_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  ) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas super administradores podem consultar emails de outros usuários.';
  END IF;

  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_user_id;

  RETURN COALESCE(v_email, 'N/A');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants remain the same but function now validates internally
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;
