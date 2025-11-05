# 졸업 프로젝트: 알바 관리 앱 주요 컴포넌트 (클래스) 정리

이 문서는 프로젝트에서 사용된 주요 React Native 컴포넌트들을 기능별로 분류하여 정리합니다. 대부분의 컴포넌트는 함수형 컴포넌트 형태로 구현되었을 것으로 예상됩니다.

## 1. 화면 (Screen) 컴포넌트

애플리케이션의 각 주요 화면을 구성하는 컴포넌트들입니다.

### 1.1. 인증 및 사용자 관리

- `AuthSelectionScreen.js`: 사용자(근로자/고용주) 유형 선택 화면
- `LoginEmployeeScreen.js`: 근로자 로그인 화면
- `LoginEmployerScreen.js`: 고용주 로그인 화면
- `RegisterEmployeeScreen.js`: 근로자 회원가입 화면
- `RegisterEmployerScreen.js`: 고용주 회원가입 화면
- `LoginScreen.js`: 일반 로그인 화면 (초기 로그인)
- `RegisterScreen.js`: 일반 회원가입 화면 (초기 회원가입)
- `ProfileScreen.js`: 사용자 프로필 조회 및 수정 화면
- `SplashScreen.js`: 앱 시작 시 로딩 화면

### 1.2. 고용주 전용 화면

- `EmployerCalendarScreen.js`: 고용주용 근무 스케줄 관리 캘린더 화면
- `EmployerDashboardScreen.js`: 고용주 대시보드 화면 (사업장 현황 요약)
- `EmployerHomeScreen.js`: 고용주 홈 화면
- `EmployerQRScreen.js`: 고용주용 QR 코드 생성 화면
- `ManagementScreen.js`: 일반 관리 기능 화면 (세부 기능은 파일 내용 확인 필요)
- `SalaryManagementScreen.js`: 고용주용 급여 관리 및 정산 화면

### 1.3. 근로자 및 공통 화면

- `HomeScreen.js`: 근로자 홈 화면 (또는 공통 홈 화면)
- `ScheduleScreen.js`: 근로자용 근무 스케줄 확인 화면
- `QRScannerScreen.js`: QR 코드 스캔을 통한 출퇴근 기록 화면
- `PayScreen.js`: 급여 내역 확인 화면

### 1.4. 커뮤니티 화면

- `CommunityScreen.js`: 커뮤니티 게시글 목록 화면
- `CreatePostScreen.js`: 새 게시글 작성 화면
- `PostDetailScreen.js`: 게시글 상세 내용 및 댓글 화면

## 2. 내비게이션 컴포넌트

애플리케이션의 화면 간 이동을 관리하는 컴포넌트들입니다.

- `navigation/EmployerTabNavigator.js`: 고용주용 탭 내비게이션
- `navigation/TabNavigator.js`: 공통 (또는 근로자용) 탭 내비게이션

## 3. 재사용 가능한 UI 컴포넌트 (`src/components`)

다양한 화면에서 재사용되는 범용적인 UI 요소 및 특정 기능 단위 컴포넌트들입니다.

### 3.1. 캘린더 관련 컴포넌트 (`src/components/calendar`)

- `Calendar.tsx`: 메인 캘린더 뷰
- `DayCell.tsx`: 캘린더의 각 날짜 셀
- `MonthSelector.tsx`: 월 선택 기능
- `WorkDetailModal.tsx`: 특정 날짜의 근무 상세 정보를 표시하는 모달

### 3.2. 공통 UI 요소 (`src/components/common`)

- `ActionButtons.tsx`: 공통 액션 버튼 그룹
- `Button.tsx`: 재사용 가능한 버튼 컴포넌트
- `Input.tsx`: 재사용 가능한 입력 필드 컴포넌트
- `Loading.tsx`: 로딩 인디케이터
- `Modal.tsx`: 범용 모달 창
- `QuickStats.tsx`: 요약 통계 정보를 표시하는 컴포넌트
- `TabNavigation.tsx`: 커스텀 탭 내비게이션 (하단 탭 내비게이터와는 별개일 수 있음)

### 3.3. 커뮤니티 관련 컴포넌트 (`src/components/community`)

- `CommentSection.tsx`: 게시글의 댓글 섹션
- `PostDetail.tsx`: 게시글 상세 내용을 표시하는 컴포넌트
- `PostList.tsx`: 게시글 목록을 표시하는 컴포넌트

### 3.4. 로그인/회원가입 관련 컴포넌트 (`src/components/Login`)

- `Login.tsx`: 로그인 폼 컴포넌트
- `SignUp.tsx`: 회원가입 폼 컴포넌트

### 3.5. 급여 관련 컴포넌트 (`src/components/salary`)

- `ExpenseTracker.tsx`: 지출 추적 기능 컴포넌트
- `SalaryChart.tsx`: 급여 관련 차트 표시 컴포넌트
- `TaxCalculator.tsx`: 세금 계산 기능 컴포넌트

### 3.6. 근무 관련 컴포넌트 (`src/components/work`)

- `ClockInOut.tsx`: 출퇴근 기록 기능 컴포넌트
- `QRScanner.tsx`: QR 코드 스캔 기능 컴포넌트
- `WorkHistory.tsx`: 근무 기록 조회 컴포넌트
