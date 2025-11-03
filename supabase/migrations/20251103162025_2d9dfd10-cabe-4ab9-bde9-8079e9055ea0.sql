-- Drop the view that triggered the security definer warning
DROP VIEW IF EXISTS public.phishing_reports_public;

-- The table now has:
-- 1. RLS enabled
-- 2. Only INSERT policy for submitting reports
-- 3. NO SELECT policy - only admins with service role can view reports
-- This completely protects reporter email addresses from public access

-- Add a comment explaining the security design
COMMENT ON TABLE public.phishing_reports IS 'Phishing reports table with email privacy protection. Only INSERT allowed for public; SELECT restricted to authenticated admins only.';
