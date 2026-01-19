# Alba (알바)

## 프로젝트 개요 ✅
Alba는 소규모 알바/고용 관리 앱입니다. 모바일(Expo/React Native)과 웹(Vite/React)에서 동작하도록 구성되어 있으며, Supabase를 백엔드로 사용합니다.

---

## 주요 기능 ✨
- 사용자 인증(고용주, 직원) 및 회원가입
- 근무 일정 조회 및 스케줄 관리
- QR 코드 생성/스캔(출석 확인 등)
- 게시판/커뮤니티(글 작성, 댓글)
- 급여/정산 관련 화면 및 관리 기능

---

## 빠른 시작 🔧
- 루트(모바일/공유 코드)
  - 설치: `npm install` 또는 `yarn`
  - 개발(Expo): `npm start` 또는 `yarn start` (스크립트: `expo start`)
  - Android 에뮬레이터: `npm run android`
  - iOS: `npm run ios`

- 웹(frontend)
  - 이동: `cd web`
  - 설치: `npm install` 또는 `yarn`
  - 개발: `npm run dev`

> 참고: 프로젝트가 Expo 환경을 사용하므로 Expo CLI가 필요할 수 있습니다.

---

## 파일 구조 (중요 항목만 요약) 📁
- `App.js`, `index.js` — 앱 진입점
- `supabase.js` — Supabase 클라이언트 설정
- `package.json` — 루트 스크립트(Expo), 의존성
- `android/` — Android 네이티브 설정
- `assets/` — 이미지 등 정적 자산
- `screens/` — 모바일 전용 화면들 (React Native)
- `src/` — 웹/공유 컴포넌트 및 로직
  - `src/components/` — 재사용 가능한 UI 컴포넌트
  - `src/App.tsx`, `index.tsx` — 웹 진입점
- `web/` — 웹 전용 앱( Vite + React )

루트의 SQL 스크립트들:
- `add.sql`, `attendance.sql`, `branches.sql`, `daily_qrs.sql`, `functions.sql`, `policy.sql`, 등
  - 용도: 마이그레이션, 쿼리 샘플, 백업 또는 수동 DB 작업용
  - 현재 코드베이스(런타임)에서는 직접 참조되는 곳을 찾지 못했습니다. 즉, 런타임 실행에는 없어도 되는 파일일 가능성이 높습니다. 다만 CI/CD나 수동 운영절차에서 쓰일 수 있으니 삭제 전 백업을 권장합니다.

---

## 주의/추천 사항 ⚠️
- 삭제 전: `git branch`를 생성하거나 파일을 `archive/` 폴더로 이동해 **테스트** 후 완전 제거하세요.
- DB 초기화 스크립트가 있다면(또는 팀 문서에 명시되어 있다면) 해당 프로세스를 확인하세요.
- 프로젝트 전반 검색: VS Code 전역 검색(또는 `rg/grep`)으로 `.sql`이나 파일명을 검색하면 참조 여부를 더 확실히 알 수 있습니다.

---

## 기여 및 연락 ✉️
- 간단한 변경은 Git 브랜치 생성 → PR로 진행하세요.

---

간단한 README 초안입니다. 원하시면 영어 버전으로도 만들어 드리거나, 세부 설치/환경(Expo SDK, Node 버전, 환경 변수 등)을 추가할게요.
