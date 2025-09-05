-- Update time validation from 7 PM to 1 PM
-- This migration updates any existing database constraints or functions that enforce the 7 PM restriction

-- First, let's check if there are any existing constraints and drop them
DO $$
BEGIN
    -- Drop any existing check constraints on coverage_date that might enforce time restrictions
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%coverage%' 
        AND table_name = 'media_requests'
        AND constraint_type = 'CHECK'
    ) THEN
        -- Get the constraint name and drop it
        DECLARE
            constraint_name TEXT;
        BEGIN
            SELECT tc.constraint_name INTO constraint_name
            FROM information_schema.table_constraints tc
            WHERE tc.table_name = 'media_requests'
            AND tc.constraint_type = 'CHECK'
            AND tc.constraint_name LIKE '%coverage%'
            LIMIT 1;
            
            IF constraint_name IS NOT NULL THEN
                EXECUTE 'ALTER TABLE public.media_requests DROP CONSTRAINT IF EXISTS ' || constraint_name;
            END IF;
        END;
    END IF;
END $$;

-- Create a new function to validate coverage time with 1 PM restriction
CREATE OR REPLACE FUNCTION public.validate_coverage_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the coverage date is tomorrow
    IF NEW.coverage_date = CURRENT_DATE + INTERVAL '1 day' THEN
        -- If current time is past 1 PM (13:00), block tomorrow requests
        IF EXTRACT(HOUR FROM CURRENT_TIME) >= 13 THEN
            RAISE EXCEPTION 'P0001' USING 
                MESSAGE = 'ለነገ የሚሆን የሚድያ ሽፋን ጥያቄ ከ1:00 PM በፊት መቅረብ አለበት። አሁን ሰዓቱ ካለፈ እባክዎ ከነገ ወዲያ ላለው ቀን ያስገቡ።';
        END IF;
    END IF;
    
    -- Check if coverage date is in the past
    IF NEW.coverage_date < CURRENT_DATE + INTERVAL '1 day' THEN
        RAISE EXCEPTION 'P0002' USING 
            MESSAGE = 'የሚድያ ሽፋን ጥያቄ ቢያንስ ለነገ ወይም ከዛ በኋላ ላለው ቀን መሆን አለበት።';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce the validation
DROP TRIGGER IF EXISTS validate_coverage_time_trigger ON public.media_requests;
CREATE TRIGGER validate_coverage_time_trigger
    BEFORE INSERT OR UPDATE ON public.media_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_coverage_time();

-- Add a check constraint for future dates only (as backup)
ALTER TABLE public.media_requests 
DROP CONSTRAINT IF EXISTS check_future_date;

ALTER TABLE public.media_requests 
ADD CONSTRAINT check_future_date 
CHECK (coverage_date >= CURRENT_DATE + INTERVAL '1 day');
