-- ============================================================================
-- FIX CRITICAL: redeem_coupon() Ownership Validation
-- Issue: Function doesn't validate that business_id belongs to the user
-- Impact: User can redeem coupon for someone else's business
-- ============================================================================

CREATE OR REPLACE FUNCTION redeem_coupon(
  p_coupon_code TEXT,
  p_business_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_coupon RECORD;
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não autenticado'
    );
  END IF;

  -- ✅ SECURITY FIX: Validate business ownership
  IF NOT EXISTS (
    SELECT 1 FROM businesses
    WHERE id = p_business_id
    AND user_id = v_user_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Negócio não encontrado ou sem permissão'
    );
  END IF;

  -- Get and validate coupon (with row lock to prevent race conditions)
  SELECT * INTO v_coupon
  FROM coupons
  WHERE code = UPPER(p_coupon_code)
  AND is_active = true
  AND (valid_from IS NULL OR valid_from <= NOW())
  AND (valid_until IS NULL OR valid_until >= NOW())
  AND (max_redemptions IS NULL OR current_redemptions < max_redemptions)
  FOR UPDATE;  -- ✅ RACE CONDITION FIX: Pessimistic lock

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cupom inválido, expirado ou esgotado'
    );
  END IF;

  -- Check if already redeemed
  IF EXISTS (
    SELECT 1 FROM coupon_redemptions
    WHERE coupon_id = v_coupon.id
    AND business_id = p_business_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cupom já utilizado por este negócio'
    );
  END IF;

  -- Insert redemption
  INSERT INTO coupon_redemptions (
    coupon_id,
    business_id,
    user_id,
    discount_applied,
    trial_days_added
  ) VALUES (
    v_coupon.id,
    p_business_id,
    v_user_id,
    v_coupon.discount_value,
    v_coupon.trial_days
  );

  -- Update coupon redemption count
  UPDATE coupons
  SET current_redemptions = current_redemptions + 1
  WHERE id = v_coupon.id;

  -- Apply benefits based on coupon type
  IF v_coupon.discount_type = 'free_trial' THEN
    -- Extend trial period
    UPDATE businesses
    SET trial_ends_at = GREATEST(
      COALESCE(trial_ends_at, NOW()),
      NOW()
    ) + (v_coupon.trial_days || ' days')::INTERVAL
    WHERE id = p_business_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'coupon', json_build_object(
      'code', v_coupon.code,
      'type', v_coupon.discount_type,
      'value', v_coupon.discount_value,
      'trial_days', v_coupon.trial_days,
      'description', v_coupon.description
    )
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', 'Erro ao aplicar cupom: ' || SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
