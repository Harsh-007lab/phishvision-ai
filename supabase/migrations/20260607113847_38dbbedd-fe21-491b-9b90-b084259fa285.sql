-- Anonymous role must only reach scan history through the sanitized view
REVOKE SELECT ON public.scan_history FROM anon;