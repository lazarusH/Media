-- Next-day request cut-off at 1:00 PM local server time

-- optional: remove any existing time validation artifacts
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'media_requests' AND constraint_type = 'CHECK'
  ) THEN
    -- best-effort drop; specific names can differ
    EXECUTE (
      SELECT 'ALTER TABLE public.media_requests DROP CONSTRAINT ' || quote_ident(tc.constraint_name)
      FROM information_schema.table_constraints tc
      WHERE tc.table_name = 'media_requests' AND tc.constraint_type = 'CHECK'
      LIMIT 1
    );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.validate_coverage_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coverage_date = CURRENT_DATE + INTERVAL '1 day' THEN
    IF EXTRACT(HOUR FROM CURRENT_TIME) >= 13 THEN
      RAISE EXCEPTION 'P0001' USING 
        MESSAGE = 'ለነገ የሚሆን የሚድያ ሽፋን ጥያቄ ከ1:00 PM በፊት መቅረብ አለበት።';
    END IF;
  END IF;

  IF NEW.coverage_date < CURRENT_DATE + INTERVAL '1 day' THEN
    RAISE EXCEPTION 'P0002' USING 
      MESSAGE = 'ለዛሬ/ያለፈ ቀን ጥያቄ አይቻልም።';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_coverage_time_trigger ON public.media_requests;
CREATE TRIGGER validate_coverage_time_trigger
  BEFORE INSERT OR UPDATE ON public.media_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_coverage_time();

-- backup date constraint
ALTER TABLE public.media_requests 
DROP CONSTRAINT IF EXISTS check_future_date;

ALTER TABLE public.media_requests 
ADD CONSTRAINT check_future_date 
CHECK (coverage_date >= CURRENT_DATE + INTERVAL '1 day');

