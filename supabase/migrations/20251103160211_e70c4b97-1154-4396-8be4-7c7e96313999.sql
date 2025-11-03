-- Create table for scan history
CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  label TEXT NOT NULL,
  score NUMERIC NOT NULL,
  confidence NUMERIC NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_scan_history_created_at ON public.scan_history(created_at DESC);
CREATE INDEX idx_scan_history_label ON public.scan_history(label);

-- Enable Row Level Security
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Create policy - allow anyone to read (public app)
CREATE POLICY "Anyone can view scan history" 
ON public.scan_history 
FOR SELECT 
USING (true);

-- Create policy - allow anyone to insert scans
CREATE POLICY "Anyone can insert scans" 
ON public.scan_history 
FOR INSERT 
WITH CHECK (true);

-- Create table for phishing reports
CREATE TABLE public.phishing_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  reporter_email TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.phishing_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for reports
CREATE POLICY "Anyone can view approved reports" 
ON public.phishing_reports 
FOR SELECT 
USING (status = 'approved' OR status = 'pending');

CREATE POLICY "Anyone can submit reports" 
ON public.phishing_reports 
FOR INSERT 
WITH CHECK (true);