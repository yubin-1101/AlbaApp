-- schedules 테이블에 Row Level Security 활성화
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 스케줄을 추가할 수 있도록 허용하는 정책
CREATE POLICY "Users can insert their own schedule"
ON public.schedules
FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- 사용자가 자신의 스케줄을 볼 수 있도록 허용하는 정책
CREATE POLICY "Users can view their own schedules"
ON public.schedules
FOR SELECT
USING ( auth.uid() = user_id );

-- 사용자가 자신의 스케줄을 삭제할 수 있도록 허용하는 정책
CREATE POLICY "Users can delete their own schedules"
ON public.schedules
FOR DELETE
USING ( auth.uid() = user_id );
