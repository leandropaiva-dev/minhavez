-- Add review/feedback fields to page_customizations table
-- These fields are specifically for 'queue_completed' and 'reservation_confirm' page types

ALTER TABLE page_customizations
ADD COLUMN IF NOT EXISTS review_link TEXT,
ADD COLUMN IF NOT EXISTS review_button_text TEXT DEFAULT 'Avaliar Atendimento',
ADD COLUMN IF NOT EXISTS thank_you_message TEXT,
ADD COLUMN IF NOT EXISTS cta_link TEXT,
ADD COLUMN IF NOT EXISTS cta_button_text TEXT,
ADD COLUMN IF NOT EXISTS cta_icon TEXT DEFAULT 'star',
ADD COLUMN IF NOT EXISTS auto_redirect_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_redirect_url TEXT,
ADD COLUMN IF NOT EXISTS auto_redirect_delay INTEGER DEFAULT 5;

-- Add comment explaining the new fields
COMMENT ON COLUMN page_customizations.review_link IS 'URL for review/rating (Google, Facebook, etc.)';
COMMENT ON COLUMN page_customizations.review_button_text IS 'Customizable text for review button';
COMMENT ON COLUMN page_customizations.thank_you_message IS 'Personalized thank you message after completion';
COMMENT ON COLUMN page_customizations.cta_link IS 'Additional call-to-action link (Instagram, WhatsApp, website)';
COMMENT ON COLUMN page_customizations.cta_button_text IS 'Text for the CTA button';
COMMENT ON COLUMN page_customizations.cta_icon IS 'Icon name for the CTA button';
COMMENT ON COLUMN page_customizations.auto_redirect_enabled IS 'Enable automatic redirect after completion';
COMMENT ON COLUMN page_customizations.auto_redirect_url IS 'URL to redirect to automatically';
COMMENT ON COLUMN page_customizations.auto_redirect_delay IS 'Delay in seconds before redirect (default 5)';
