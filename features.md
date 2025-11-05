# 졸업 프로젝트: 알바 관리 앱 기능 명세서

## 1. 프로젝트 개요

이 프로젝트는 아르바이트생과 고용주를 위한 모바일 애플리케이션입니다. 아르바이트생의 근무 관리, 급여 정산, 커뮤니티 기능을 제공하여 효율적인 인력 관리를 돕고, 아르바이트생에게는 편리한 근무 환경을 제공하는 것을 목표로 합니다.

## 2. 핵심 기술 스택

- **프레임워크:** React Native (Expo)
- **UI 라이브러리:** React Native Paper, React Native Calendars
- **내비게이션:** React Navigation (`@react-navigation/bottom-tabs`, `@react-navigation/stack`)
- **백엔드 (BaaS):** Supabase (데이터베이스, 인증)
- **QR 코드:** `expo-barcode-scanner`, `react-native-qrcode-svg`
- **카메라:** `expo-camera`
- **언어:** JavaScript (ES6+), TypeScript

## 3. 주요 기능 및 구현

### 3.1. 사용자 인증 (근로자/고용주)

- **기능:**
    - 근로자와 고용주를 구분하여 회원가입 및 로그인을 처리합니다.
    - 사용자 유형에 따라 다른 화면과 기능을 제공합니다.
    - 프로필 정보를 조회하고 수정할 수 있습니다.
- **관련 파일:**
    - `screens/AuthSelectionScreen.js`: 사용자 유형 선택 화면
    - `screens/LoginEmployeeScreen.js`: 근로자 로그인 화면
    - `screens/LoginEmployerScreen.js`: 고용주 로그인 화면
    - `screens/RegisterEmployeeScreen.js`: 근로자 회원가입 화면
    - `screens/RegisterEmployerScreen.js`: 고용주 회원가입 화면
    - `screens/ProfileScreen.js`: 프로필 화면
    - `supabase.js`: Supabase 클라이언트를 이용한 인증 처리
- **사용 라이브러리:** `@supabase/supabase-js`, `@react-navigation/stack`

### 3.2. 근무 스케줄 관리

- **기능:**
    - 고용주는 근무 스케줄을 등록하고 관리할 수 있습니다.
    - 근로자는 자신의 근무 스케줄을 캘린더 형태로 확인합니다.
    - 날짜별 근무 내역을 상세 조회할 수 있습니다.
- **관련 파일:**
    - `screens/EmployerCalendarScreen.js`: 고용주용 캘린더/스케줄 관리 화면
    - `screens/ScheduleScreen.js`: 근로자용 스케줄 확인 화면
    - `src/components/calendar/`: 캘린더 관련 컴포넌트 (`Calendar.tsx`, `DayCell.tsx`, `WorkDetailModal.tsx`)
- **사용 라이브러리:** `react-native-calendars`, `date-fns`

### 3.3. QR 코드를 이용한 출퇴근 관리

- **기능:**
    - 고용주는 근무지별로 고유한 QR 코드를 생성합니다.
    - 근로자는 앱의 QR 스캐너를 통해 출퇴근을 기록합니다.
    - 출퇴근 기록은 데이터베이스에 저장되어 급여 계산에 활용됩니다.
- **관련 파일:**
    - `screens/EmployerQRScreen.js`: 고용주의 QR 코드 생성 화면
    - `screens/QRScannerScreen.js`: 근로자의 QR 코드 스캔 화면
    - `supabase.js`: 출퇴근 기록을 Supabase에 저장
    - `attendance.sql`, `daily_qrs.sql`: 관련 데이터베이스 테이블 구조
- **사용 라이브러리:** `expo-barcode-scanner`, `react-native-qrcode-svg`, `expo-camera`

### 3.4. 커뮤니티

- **기능:**
    - 사용자 간의 소통을 위한 게시판 기능을 제공합니다.
    - 게시글을 작성, 조회, 수정, 삭제할 수 있습니다.
    - 게시글에 댓글을 작성하고 조회할 수 있습니다.
- **관련 파일:**
    - `screens/CommunityScreen.js`: 커뮤니티 게시글 목록 화면
    - `screens/CreatePostScreen.js`: 게시글 작성 화면
    - `screens/PostDetailScreen.js`: 게시글 상세 및 댓글 화면
    - `src/components/community/`: 커뮤니티 관련 컴포넌트 (`PostList.tsx`, `PostDetail.tsx`, `CommentSection.tsx`)

### 3.5. 급여 관리 및 정산

- **기능:**
    - 출퇴근 기록을 바탕으로 예상 급여를 자동으로 계산합니다.
    - 고용주는 근로자의 급여 지급을 관리하고 내역을 확인할 수 있습니다.
    - 세금 계산, 지출 추적 등 부가 기능을 제공합니다.
- **관련 파일:**
    - `screens/SalaryManagementScreen.js`: 고용주의 급여 관리 화면
    - `screens/PayScreen.js`: 근로자의 급여 확인 화면
    - `src/components/salary/`: 급여 관련 컴포넌트 (`SalaryChart.tsx`, `TaxCalculator.tsx`, `ExpenseTracker.tsx`)
    - `money.sql`: 급여 관련 데이터베이스 스키마
- **사용 라이브러리:** `date-fns` (날짜/시간 계산)

### 3.6. 고용주 대시보드

- **기능:**
    - 고용주에게 사업장 현황을 요약하여 보여줍니다.
    - 실시간 근무 현황, 공지사항 등을 확인할 수 있습니다.
- **관련 파일:**
    - `screens/EmployerDashboardScreen.js`: 대시보드 메인 화면
    - `screens/EmployerHomeScreen.js`: 고용주 홈 화면
    - `src/components/common/QuickStats.tsx`: 빠른 통계 컴포넌트
