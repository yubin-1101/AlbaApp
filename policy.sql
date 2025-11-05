-- policy.sql

-- Enable RLS on branches table (if not already enabled)
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Policy: Allow employers to insert a branch for themselves.
CREATE POLICY "Employers can insert their own branch."
ON public.branches
FOR INSERT
WITH CHECK (auth.uid() = employer_id);

-- Policy: Allow employers to view their own branch information.
CREATE POLICY "Employers can view their own branch."
ON public.branches
FOR SELECT
USING (auth.uid() = employer_id);

