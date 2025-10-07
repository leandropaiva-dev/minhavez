-- Enable Realtime for queue_entries table
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_entries;

-- Ensure realtime is enabled for businesses table as well
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
