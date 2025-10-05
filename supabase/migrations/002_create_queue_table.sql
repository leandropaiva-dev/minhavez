-- Create queue_entries table
CREATE TABLE IF NOT EXISTS public.queue_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  party_size INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'attending', 'completed', 'cancelled', 'no_show')),
  position INTEGER,
  notes TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  called_at TIMESTAMP WITH TIME ZONE,
  attended_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_wait_time INTEGER, -- em minutos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_queue_business_status ON public.queue_entries(business_id, status);
CREATE INDEX idx_queue_business_joined ON public.queue_entries(business_id, joined_at);
CREATE INDEX idx_queue_position ON public.queue_entries(business_id, position) WHERE status = 'waiting';

-- Enable RLS
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (join queue)
CREATE POLICY "Anyone can join queue"
  ON public.queue_entries
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can view their own entry by id
CREATE POLICY "Anyone can view their own queue entry"
  ON public.queue_entries
  FOR SELECT
  USING (true);

-- Policy: Business owner can update their queue entries
CREATE POLICY "Business owner can update queue entries"
  ON public.queue_entries
  FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Policy: Business owner can delete their queue entries
CREATE POLICY "Business owner can delete queue entries"
  ON public.queue_entries
  FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_queue_entries_updated_at
  BEFORE UPDATE ON public.queue_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_queue_updated_at();

-- Function to auto-calculate position
CREATE OR REPLACE FUNCTION calculate_queue_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'waiting' AND NEW.position IS NULL THEN
    SELECT COALESCE(MAX(position), 0) + 1
    INTO NEW.position
    FROM public.queue_entries
    WHERE business_id = NEW.business_id
    AND status = 'waiting';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate position on insert
CREATE TRIGGER calculate_position_on_insert
  BEFORE INSERT ON public.queue_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_queue_position();
