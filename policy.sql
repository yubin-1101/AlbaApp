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

-- daily_qrs 테이블에 RLS 활성화
ALTER TABLE public.daily_qrs ENABLE ROW LEVEL SECURITY;

-- 정책 추가: 고용주가 자신의 지점에 대한 QR 정보를 추가할 수 있도록 허용합니다.
CREATE POLICY "Employers can insert daily QR for their branch."
ON public.daily_qrs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.branches
    WHERE branches.id = daily_qrs.branch_id AND branches.employer_id = auth.uid()
  )
);

-- 정책 추가: 고용주가 자신의 지점에 대한 QR 정보를 조회할 수 있도록 허용합니다.
CREATE POLICY "Employers can read daily QR for their branch."
ON public.daily_qrs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.branches
    WHERE branches.id = daily_qrs.branch_id AND branches.employer_id = auth.uid()
  )
);
