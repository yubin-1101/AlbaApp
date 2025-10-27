-- 1. "profiles" 테이블을 생성합니다.
-- 이 테이블은 사용자의 추가 정보(이름, 역할, 소속 지점)를 저장합니다.
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  full_name TEXT,
  role TEXT,
  branch_id BIGINT REFERENCES public.branches(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user.';
COMMENT ON COLUMN public.profiles.id IS 'auth.users 테이블의 id와 연결됩니다.';
COMMENT ON COLUMN public.profiles.role IS '사용자 역할: ''employer'' 또는 ''employee''';
COMMENT ON COLUMN public.profiles.branch_id IS '직원의 경우, 소속된 지점 ID와 연결됩니다.';

-- 2. 테이블에 대한 Row Level Security (RLS)를 활성화합니다.
-- 데이터베이스 보안을 위해 반드시 필요한 설정입니다.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. 사용자가 자신의 프로필만 볼 수 있도록 SELECT 정책을 설정합니다.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- 4. 사용자가 자신의 프로필만 생성할 수 있도록 INSERT 정책을 설정합니다.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

-- 5. 사용자가 자신의 프로필만 수정할 수 있도록 UPDATE 정책을 설정합니다.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- 6. 새로운 사용자가 회원가입할 때 자동으로 프로필을 생성하는 함수를 만듭니다.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- auth.users 테이블의 raw_user_meta_data에서 full_name과 role을 가져와 profiles 테이블에 삽입합니다.
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. auth.users 테이블에 새로운 사용자가 추가된 후 handle_new_user 함수를 실행하는 트리거를 생성합니다.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
