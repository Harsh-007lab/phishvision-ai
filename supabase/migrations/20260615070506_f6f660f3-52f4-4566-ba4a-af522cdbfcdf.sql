
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert scans" ON public.scan_history;
DROP POLICY IF EXISTS "Public can read non-identifying scan fields" ON public.scan_history;

-- Revoke direct INSERT from anon/authenticated; writes go via edge function (service_role)
REVOKE INSERT ON public.scan_history FROM anon;
REVOKE SELECT ON public.scan_history FROM anon;

-- Authenticated users may insert only rows attributed to themselves
CREATE POLICY "Users insert own scans"
ON public.scan_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
