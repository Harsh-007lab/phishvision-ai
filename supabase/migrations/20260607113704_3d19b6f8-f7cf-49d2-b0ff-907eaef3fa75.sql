-- Explicitly restrict SELECT on phishing_reports to prevent accidental exposure of reporter emails
CREATE POLICY "No public read access to phishing reports"
ON public.phishing_reports
FOR SELECT
USING (false);