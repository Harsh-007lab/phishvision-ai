-- Drop the existing public SELECT policy that exposes email addresses
DROP POLICY IF EXISTS "Anyone can view approved reports" ON public.phishing_reports;

-- Keep the INSERT policy for report submissions (already secure)
-- Only authenticated admins should view reports with email addresses

-- Create a public view that excludes sensitive information
CREATE OR REPLACE VIEW public.phishing_reports_public AS
SELECT 
  id,
  url,
  description,
  status,
  created_at
FROM public.phishing_reports
WHERE status = 'approved';

-- Grant SELECT on the view to everyone
GRANT SELECT ON public.phishing_reports_public TO anon, authenticated;

-- Add comment explaining the security measure
COMMENT ON VIEW public.phishing_reports_public IS 'Public view of approved phishing reports without exposing reporter email addresses';
