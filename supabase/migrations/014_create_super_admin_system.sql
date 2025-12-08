-- ============================================================================
-- SUPER ADMIN SYSTEM - MAXIMUM SECURITY
-- ============================================================================

-- 1. Create super_admins table (separate from users for extra security)
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id), -- Track who created this admin
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,

  -- Security: Must be manually inserted by database admin
  CONSTRAINT super_admin_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for faster lookups
CREATE INDEX idx_super_admins_user_id ON super_admins(user_id);
CREATE INDEX idx_super_admins_email ON super_admins(email);

-- 2. Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,

  -- Discount configuration
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_trial')),
  discount_value DECIMAL(10,2), -- For percentage (0-100) or fixed amount
  trial_days INTEGER, -- For free trial coupons (e.g., 30, 60, 90)

  -- Usage limits
  max_redemptions INTEGER, -- NULL = unlimited
  current_redemptions INTEGER DEFAULT 0,

  -- Validity period
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,

  -- Metadata
  description TEXT,
  created_by UUID NOT NULL REFERENCES super_admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,

  -- Constraints
  CONSTRAINT coupon_code_format CHECK (code ~ '^[A-Z0-9_-]{3,50}$'),
  CONSTRAINT coupon_discount_value_check CHECK (
    (discount_type = 'percentage' AND discount_value >= 0 AND discount_value <= 100) OR
    (discount_type = 'fixed_amount' AND discount_value > 0) OR
    (discount_type = 'free_trial' AND trial_days > 0)
  )
);

-- Indexes
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_valid_until ON coupons(valid_until);

-- 3. Create coupon redemptions tracking
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Redemption details
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  discount_applied DECIMAL(10,2),
  trial_days_added INTEGER,

  -- Prevent duplicate redemptions
  UNIQUE(coupon_id, business_id)
);

-- Indexes
CREATE INDEX idx_coupon_redemptions_coupon ON coupon_redemptions(coupon_id);
CREATE INDEX idx_coupon_redemptions_business ON coupon_redemptions(business_id);
CREATE INDEX idx_coupon_redemptions_user ON coupon_redemptions(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - MAXIMUM PROTECTION
-- ============================================================================

-- Super Admins Table
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Only super admins can view super admin list
CREATE POLICY "Only super admins can view super admins"
  ON super_admins FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT user_id FROM super_admins WHERE is_active = true)
  );

-- NO ONE can insert/update/delete via RLS (must use database functions)
CREATE POLICY "No direct insert on super_admins"
  ON super_admins FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct update on super_admins"
  ON super_admins FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No direct delete on super_admins"
  ON super_admins FOR DELETE
  TO authenticated
  USING (false);

-- Coupons Table
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage coupons
CREATE POLICY "Only super admins can view coupons"
  ON coupons FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins WHERE is_active = true)
  );

CREATE POLICY "Only super admins can create coupons"
  ON coupons FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM super_admins WHERE is_active = true)
  );

CREATE POLICY "Only super admins can update coupons"
  ON coupons FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins WHERE is_active = true)
  );

CREATE POLICY "Only super admins can delete coupons"
  ON coupons FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins WHERE is_active = true)
  );

-- Coupon Redemptions Table
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Super admins can view all redemptions
CREATE POLICY "Super admins can view all redemptions"
  ON coupon_redemptions FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins WHERE is_active = true)
  );

-- Users can only see their own redemptions
CREATE POLICY "Users can view their own redemptions"
  ON coupon_redemptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only authenticated users can redeem coupons (via function)
CREATE POLICY "Users can redeem coupons"
  ON coupon_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SECURE FUNCTIONS
-- ============================================================================

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM super_admins
    WHERE user_id = check_user_id
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and redeem coupon
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

  -- Get and validate coupon
  SELECT * INTO v_coupon
  FROM coupons
  WHERE code = UPPER(p_coupon_code)
  AND is_active = true
  AND (valid_from IS NULL OR valid_from <= NOW())
  AND (valid_until IS NULL OR valid_until >= NOW())
  AND (max_redemptions IS NULL OR current_redemptions < max_redemptions);

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

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES super_admins(id),
  action TEXT NOT NULL,
  target_type TEXT, -- 'coupon', 'user', 'business', etc
  target_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can view audit log"
  ON admin_audit_log FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins WHERE is_active = true)
  );

-- ============================================================================
-- INITIAL SETUP INSTRUCTIONS
-- ============================================================================

-- To create your first super admin, run this SQL (replace with your email):
--
-- INSERT INTO super_admins (user_id, email, is_active)
-- SELECT id, email, true
-- FROM auth.users
-- WHERE email = 'seu-email@exemplo.com';
--
-- NOTE: This must be done manually in the SQL editor for security!
