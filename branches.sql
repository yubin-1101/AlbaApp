-- branches.sql
CREATE TABLE public.branches (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  employer_id UUID REFERENCES public.employers(user_id),
  name TEXT NOT NULL,
  branch_code TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 0, 7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.branches IS '사업장(지점) 정보';
COMMENT ON COLUMN public.branches.employer_id IS '고용주 ID';
COMMENT ON COLUMN public.branches.name IS '지점 이름';
COMMENT ON COLUMN public.branches.branch_code IS '지점 코드 (직원 등록용)';
