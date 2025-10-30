-- Realtime config
ALTER TABLE public.media_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.media_requests;

