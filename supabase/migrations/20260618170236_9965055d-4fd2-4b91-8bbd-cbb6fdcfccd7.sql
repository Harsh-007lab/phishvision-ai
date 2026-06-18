ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS weekly_digest boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS threat_alerts boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS scan_reminders boolean NOT NULL DEFAULT false;