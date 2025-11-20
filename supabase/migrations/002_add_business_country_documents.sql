-- Add country and document fields to businesses table
-- Migration 002: Support for Brazil and Portugal business documents

ALTER TABLE businesses
  ADD COLUMN country TEXT DEFAULT 'BR',
  ADD COLUMN document_type TEXT,
  ADD COLUMN document_number TEXT;

-- Add check constraint for country
ALTER TABLE businesses
  ADD CONSTRAINT country_check CHECK (
    country IN ('BR', 'PT')
  );

-- Add check constraint for document_type
ALTER TABLE businesses
  ADD CONSTRAINT document_type_check CHECK (
    document_type IN ('CNPJ', 'CPF', 'NIF_EMPRESA', 'NIF_INDIVIDUAL')
  );

-- Add index for faster queries by country
CREATE INDEX idx_businesses_country ON businesses(country);

-- Add index for document lookups (useful for validation)
CREATE INDEX idx_businesses_document_number ON businesses(document_number);

-- Add comment for documentation
COMMENT ON COLUMN businesses.country IS 'Business country: BR (Brazil) or PT (Portugal)';
COMMENT ON COLUMN businesses.document_type IS 'Document type: CNPJ/CPF for Brazil, NIF_EMPRESA/NIF_INDIVIDUAL for Portugal';
COMMENT ON COLUMN businesses.document_number IS 'Formatted document number (CNPJ, CPF, or NIF)';
