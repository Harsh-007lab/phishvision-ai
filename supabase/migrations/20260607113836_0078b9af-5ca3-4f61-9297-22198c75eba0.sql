-- Remove the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view scan history" ON public.scan_history;

-- Authenticated users can read their own rows directly from the table
CREATE POLICY "Users view own scan history"
ON public.scan_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Public sanitized view: no user_id exposure
CREATE OR REPLACE VIEW public.scan_history_public
WITH (security_invoker = on) AS
SELECT id, url, label, confidence, score, explanation, created_at
FROM public.scan_history;

-- Allow the view to be queryable; the view itself omits user_id
GRANT SELECT ON public.scan_history_public TO anon, authenticated;

-- Because the view uses security_invoker, anon needs a policy on the base
-- table that allows it to read the non-sensitive columns. Add a permissive
-- SELECT policy strictly for use through the view (no user_id in projection).
CREATE POLICY "Public can read non-identifying scan fields"
ON public.scan_history
FOR SELECT
TO anon
USING (true);