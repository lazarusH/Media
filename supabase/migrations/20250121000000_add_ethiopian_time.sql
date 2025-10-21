-- Add Ethiopian time format column to store original user input
ALTER TABLE public.media_requests 
ADD COLUMN ethiopian_time TEXT;

-- Update existing records to have a default value
UPDATE public.media_requests 
SET ethiopian_time = coverage_time::text 
WHERE ethiopian_time IS NULL;
