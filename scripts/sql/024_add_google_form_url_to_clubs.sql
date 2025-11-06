-- Add google_form_url column to clubs table if it doesn't exist
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS google_form_url TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.clubs.google_form_url IS 'URL to the Google Form for joining this club';
