import React, { useState } from 'react';
import './App.css';
import { Calendar } from './components/calendar/Calendar';
import { ClockInOut } from './components/work/ClockInOut';
import { WorkHistory } from './components/work/WorkHistory';
import { SalaryChart } from './components/salary/SalaryChart';
import { ExpenseTracker } from './components/salary/ExpenseTracker';
import { TaxCalculator } from './components/salary/TaxCalculator';
import { PostList } from './components/community/PostList';
import { TabNavigation, TabItem } from './components/common/TabNavigation';
import { QuickStats } from './components/common/QuickStats';
import { ActionButtons } from './components/common/ActionButtons';
import Login from './components/Login/Login'; // Login import
import SignUp from './components/Login/SignUp';



// 임시 데이터
const mockWorkRecords = [
  { id: '1', date: '2023-10-26', clockIn: '2023-10-26T09:00:00', clockOut: '2023-10-26T18:00:00', workHours: 9, dailySalary: 90000, location: '강남점' },
  { id: '2', date: '2023-10-27', clockIn: '2023-10-27T09:30:00', clockOut: '2023-10-27T17:30:00', workHours: 8, dailySalary: 80000, location: '홍대점' },
  { id: '3', date: '2023-10-28', clockIn: '2023-10-28T10:00:00', workHours: 0, dailySalary: 0, location: '건대점' }, // 근무 중
  { id: '4', date: '2023-10-29', clockIn: '', workHours: 0, dailySalary: 0, location: '' }, // 미출근
  { id: '5', date: '2023-10-30', clockIn: '2023-10-30T09:00:00', clockOut: '2023-10-30T18:00:00', workHours: 9, dailySalary: 90000, location: '강남점' },
];

const mockSalaryData = [
  { month: '1월', totalSalary: 1500000, totalHours: 150, avgHourlyWage: 10000, netSalary: 1350000 },
  { month: '2월', totalSalary: 1600000, totalHours: 160, avgHourlyWage: 10000, netSalary: 1440000 },
  { month: '3월', totalSalary: 1700000, totalHours: 170, avgHourlyWage: 10000, netSalary: 1530000 },
  { month: '4월', totalSalary: 1800000, totalHours: 180, avgHourlyWage: 10000, netSalary: 1620000 },
  { month: '5월', totalSalary: 1900000, totalHours: 190, avgHourlyWage: 10000, netSalary: 1710000 },
  { month: '6월', totalSalary: 2000000, totalHours: 200, avgHourlyWage: 10000, netSalary: 1800000 },
  { month: '7월', totalSalary: 2100000, totalHours: 210, avgHourlyWage: 10000, netSalary: 1890000 },
  { month: '8월', totalSalary: 2200000, totalHours: 220, avgHourlyWage: 10000, netSalary: 1980000 },
  { month: '9월', totalSalary: 2300000, totalHours: 230, avgHourlyWage: 10000, netSalary: 2070000 },
  { month: '10월', totalSalary: 2400000, totalHours: 240, avgHourlyWage: 10000, netSalary: 2160000 },
];

const mockExpenses = [
  { id: 'e1', amount: 50000, category: '식비', description: '점심 식사', date: '2023-10-25' },
  { id: 'e2', amount: 25000, category: '교통비', description: '버스 지하철', date: '2023-10-25' },
  { id: 'e3', amount: 120000, category: '문화생활', description: '영화 관람', date: '2023-10-24' },
];

const mockPosts = [
  { 
    id: 'p1', 
    title: '알바생 고충 토로합니다', 
    content: '오늘도 진상 손님 때문에 힘들었어요...', 
    category: '근무 팁', 
    author: '익명1', 
    createdAt: '2023-10-26T10:00:00',
    likes: 15, 
    comments: 5, 
    views: 120
  },
  { 
    id: 'p2', 
    title: '꿀알바 정보 공유해요!', 
    content: '저희 동네 카페 알바 시급도 높고 사장님도 좋아요!', 
    category: '알바 정보', 
    author: '알바왕', 
    createdAt: '2023-10-25T15:30:00',
    likes: 30, 
    comments: 10, 
    views: 250
  },
  { 
    id: 'p3', 
    title: '급여 명세서 확인하는 법', 
    content: '급여 명세서 꼼꼼히 확인해서 손해보지 마세요!', 
    category: '근무 팁', 
    author: '급여요정', 
    createdAt: '2023-10-24T09:15:00',
    likes: 5, 
    comments: 2, 
    views: 80
  },
];

// 탭 정의
const tabs: TabItem[] = [
  { id: 'calendar', label: '출근관리', icon: '📅', active: true },
  { id: 'work', label: '출퇴근', icon: '⏰', active: false },
  { id: 'salary', label: '급여', icon: '💰', active: false },
  { id: 'expense', label: '지출', icon: '💸', active: false },
  { id: 'community', label: '커뮤니티', icon: '💬', active: false },
];

function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [tabList, setTabList] = useState(tabs);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState<'admin' | 'user' | null>(null);

const handleLoginSuccess = (name: string, type: 'admin' | 'user') => {
    setUserName(name);
    setUserType(type);
    setIsLoggedIn(true);
  };

  const handleGoToSignUp = () => {
    setShowSignUp(true);
  };

  const handleSignUpSuccess = () => {
    setShowSignUp(false);
  };

  const handleDateSelect = (date: string) => {
    console.log('날짜 클릭:', date);
    // 실제 앱에서는 해당 날짜의 상세 정보를 불러오는 로직 추가
  };

  const handleClockIn = (location: string) => {
    console.log('출근:', location);
    // 출근 처리 로직
  };

  const handleClockOut = () => {
    console.log('퇴근');
    // 퇴근 처리 로직
  };

  const handlePeriodChange = (period: 'monthly' | 'weekly') => {
    console.log('기간 변경:', period);
    // 급여 통계 기간 변경 로직
  };

  const handleAddExpense = (expense: { amount: number; category: string; description: string; date: string }) => {
    console.log('지출 추가:', expense);
    // 지출 추가 로직
  };

  const handleDeleteExpense = (id: string) => {
    console.log('지출 삭제:', id);
    // 지출 삭제 로직
  };

  const handleEditExpense = (id: string, updatedExpense: { amount: number; category: string; description: string; date: string }) => {
    console.log('지출 수정:', id, updatedExpense);
    // 지출 수정 로직
  };

  const handlePostClick = (post: { id: string; title: string; content: string; author: string; createdAt: string; likes: number; comments: number; views: number; category: string }) => {
    console.log('게시글 클릭:', post);
    // 게시글 상세 보기 로직
  };

  const handleCategoryFilter = (category: string) => {
    console.log('카테고리 필터:', category);
    // 커뮤니티 카테고리 필터링 로직
  };

  const handleSearch = (query: string) => {
    console.log('검색:', query);
    // 커뮤니티 검색 로직
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setTabList(tabList.map(tab => ({
      ...tab,
      active: tab.id === tabId
    })));
  };

  // 현재 활성 탭에 따른 화면 렌더링
  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <div className="app-content">
            <section className="calendar-main-section">
              <h2 className="calendar-main-title">📅 출근 관리</h2>
              <Calendar 
                workRecords={mockWorkRecords}
                onDateClick={handleDateSelect}
              />
            </section>
            <aside className="sidebar-section">
              <QuickStats 
                title="이번 달 근무 요약"
                stats={[
                  { label: '총 근무일', value: 22, unit: '일', icon: '📅', color: '#667eea' },
                  { label: '총 근무시간', value: 176, unit: '시간', icon: '⏰', color: '#48bb78' },
                  { label: '예상 급여', value: 1760000, unit: '원', icon: '💰', color: '#ed8936' },
                  { label: '평균 근무시간', value: 8, unit: '시간', icon: '📊', color: '#9f7aea' }
                ]}
                variant="success"
              />
              <ActionButtons 
                title="빠른 액션"
                actions={[
                  { label: '출근', icon: '🟢', onClick: () => handleClockIn('현재 위치'), variant: 'success' },
                  { label: '퇴근', icon: '🔴', onClick: handleClockOut, variant: 'danger' },
                  { label: '휴가신청', icon: '🏖️', onClick: () => console.log('휴가신청'), variant: 'warning' },
                  { label: '긴급연락', icon: '🚨', onClick: () => console.log('긴급연락'), variant: 'danger' }
                ]}
                layout="grid"
              />
            </aside>
          </div>
        );
      
      case 'work':
        return (
          <div className="app-content">
            <div className="main-content">
              <section className="app-section">
                <h2 className="section-title">⏰ 출퇴근</h2>
                <ClockInOut 
                  isClockedIn={false}
                  onClockIn={handleClockIn}
                  onClockOut={handleClockOut}
                />
              </section>
              <section className="app-section">
                <h2 className="section-title">📋 근무 기록</h2>
                <WorkHistory 
                  workRecords={mockWorkRecords}
                  onRecordClick={(record) => console.log('근무 기록 클릭:', record)}
                />
              </section>
            </div>
            <aside className="sidebar-section">
              <QuickStats 
                title="오늘의 근무"
                stats={[
                  { label: '현재 근무시간', value: 0, unit: '시간', icon: '⏱️', color: '#667eea' },
                  { label: '예상 퇴근시간', value: '18:00', icon: '🕕', color: '#48bb78' },
                  { label: '오늘 급여', value: 0, unit: '원', icon: '💰', color: '#ed8936' },
                  { label: '이번 주 목표', value: '80%', icon: '🎯', color: '#9f7aea' }
                ]}
                variant="info"
              />
              <ActionButtons 
                title="근무 관리"
                actions={[
                  { label: 'QR스캔', icon: '📱', onClick: () => console.log('QR스캔'), variant: 'primary' },
                  { label: '위치확인', icon: '📍', onClick: () => console.log('위치확인'), variant: 'secondary' },
                  { label: '근무일정', icon: '📅', onClick: () => console.log('근무일정'), variant: 'info' }
                ]}
                layout="list"
              />
            </aside>
          </div>
        );
      
      case 'salary':
        return (
          <div className="app-content">
            <div className="main-content">
              <section className="app-section">
                <h2 className="section-title">💰 급여 통계</h2>
                <SalaryChart 
                  data={mockSalaryData}
                  period="monthly"
                  onPeriodChange={handlePeriodChange}
                />
              </section>
              <section className="app-section">
                <h2 className="section-title">🧮 세금 계산</h2>
                <TaxCalculator 
                  monthlySalary={300000}
                  onCalculationChange={() => {}}
                />
              </section>
            </div>
            <aside className="sidebar-section">
              <QuickStats 
                title="급여 요약"
                stats={[
                  { label: '이번 달 총급여', value: 2500000, unit: '원', icon: '💰', color: '#48bb78' },
                  { label: '세후 실수령액', value: 2200000, unit: '원', icon: '💳', color: '#667eea' },
                  { label: '세금 공제액', value: 300000, unit: '원', icon: '📊', color: '#ed8936' },
                  { label: '저축 목표', value: '500000', unit: '원', icon: '🎯', color: '#9f7aea' }
                ]}
                variant="success"
              />
              <ActionButtons 
                title="급여 관리"
                actions={[
                  { label: '급여명세서', icon: '📄', onClick: () => console.log('급여명세서'), variant: 'primary' },
                  { label: '세금계산기', icon: '🧮', onClick: () => console.log('세금계산기'), variant: 'info' },
                  { label: '저축관리', icon: '🏦', onClick: () => console.log('저축관리'), variant: 'success' }
                ]}
                layout="list"
              />
            </aside>
          </div>
        );
      
      case 'expense':
        return (
          <div className="app-content">
            <div className="main-content">
              <section className="app-section">
                <h2 className="section-title">💸 지출 관리</h2>
                <ExpenseTracker 
                  expenses={mockExpenses}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onEditExpense={handleEditExpense}
                />
              </section>
            </div>
            <aside className="sidebar-section">
              <QuickStats 
                title="지출 요약"
                stats={[
                  { label: '이번 달 총지출', value: 195000, unit: '원', icon: '💸', color: '#ed8936' },
                  { label: '예산 대비', value: '65%', icon: '📊', color: '#48bb78' },
                  { label: '가장 많이 쓴', value: '문화생활', icon: '🎬', color: '#9f7aea' },
                  { label: '절약 가능액', value: 50000, unit: '원', icon: '💡', color: '#667eea' }
                ]}
                variant="warning"
              />
              <ActionButtons 
                title="지출 관리"
                actions={[
                  { label: '예산설정', icon: '📋', onClick: () => console.log('예산설정'), variant: 'primary' },
                  { label: '지출분석', icon: '📈', onClick: () => console.log('지출분석'), variant: 'info' },
                  { label: '절약팁', icon: '💡', onClick: () => console.log('절약팁'), variant: 'success' }
                ]}
                layout="list"
              />
            </aside>
          </div>
        );
      
      case 'community':
        return (
          <div className="app-content">
            <div className="main-content">
              <section className="app-section">
                <h2 className="section-title">💬 커뮤니티</h2>
                <PostList 
                  posts={mockPosts}
                  onPostClick={handlePostClick}
                  onCategoryFilter={handleCategoryFilter}
                  onSearch={handleSearch}
                />
              </section>
            </div>
            <aside className="sidebar-section">
              <QuickStats 
                title="커뮤니티 현황"
                stats={[
                  { label: '전체 회원수', value: 1250, unit: '명', icon: '👥', color: '#667eea' },
                  { label: '오늘 활성사용자', value: 89, unit: '명', icon: '🔥', color: '#ed8936' },
                  { label: '내 게시글', value: 5, unit: '개', icon: '📝', color: '#48bb78' },
                  { label: '내 댓글', value: 23, unit: '개', icon: '💬', color: '#9f7aea' }
                ]}
                variant="info"
              />
              <ActionButtons 
                title="커뮤니티"
                actions={[
                  { label: '글쓰기', icon: '✏️', onClick: () => console.log('글쓰기'), variant: 'primary' },
                  { label: '내활동', icon: '👤', onClick: () => console.log('내활동'), variant: 'secondary' },
                  { label: '인기글', icon: '🔥', onClick: () => console.log('인기글'), variant: 'warning' }
                ]}
                layout="list"
              />
            </aside>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {isLoggedIn ? (
        <>
          <header className="app-header">
            <h1 className="app-title"></h1>
            <p className="app-subtitle">
              {userType === 'admin' ? '관리자 모드' : `${userName}`}
            </p>
          </header>
          
          <main>
            {userType === 'admin' ? (
              <h2>관리자 페이지 (기능 확장 가능)</h2>
            ) : (
              renderCurrentScreen()  // ← 여기에서 기존 일반 사용자 화면 호출
            )}
          </main>

          {userType === 'user' && (
            <TabNavigation tabs={tabList} onTabChange={handleTabChange} />
          )}
        </>
      ) : showSignUp ? (
        <SignUp onSignUpSuccess={handleSignUpSuccess} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} onGoToSignUp={handleGoToSignUp} />
      )}
    </div>
  );
}


export default App;
