-- Add about column to clubs table if it doesn't exist
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS about TEXT;
