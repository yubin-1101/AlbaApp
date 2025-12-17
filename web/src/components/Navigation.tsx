import React from 'react'
import { Home, User, LogOut, Calendar, Users, LayoutDashboard, QrCode, Scan } from 'lucide-react'

type UserRole = 'employee' | 'employer' | null

interface NavigationProps {
  onLogout: () => void
  currentPage: string
  onPageChange: (page: string) => void
  userRole: UserRole
}

export default function Navigation({ onLogout, currentPage, onPageChange, userRole }: NavigationProps) {
  const handleLogout = async () => {
    localStorage.removeItem('alba_user')
    onLogout()
  }

  const isActive = (page: string) => 
    currentPage === page 
      ? userRole === 'employer' 
        ? 'bg-green-100 text-green-700' 
        : 'bg-blue-100 text-blue-700'
      : 'text-gray-700 hover:bg-gray-100'

  const employeeMenuItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'qr', label: 'QR 출퇴근', icon: Scan },
    { id: 'schedule', label: '스케줄', icon: Calendar },
    { id: 'profile', label: '프로필', icon: User },
  ]

  const employerMenuItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'qr', label: 'QR 코드', icon: QrCode },
    { id: 'employees', label: '직원 관리', icon: Users },
    { id: 'profile', label: '프로필', icon: User },
  ]

  const menuItems = userRole === 'employer' ? employerMenuItems : employeeMenuItems

  return (
    <nav className={`w-64 border-r p-4 flex flex-col ${
      userRole === 'employer' ? 'bg-gradient-to-b from-green-50 to-white border-green-100' : 'bg-gradient-to-b from-blue-50 to-white border-blue-100'
    }`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold ${userRole === 'employer' ? 'text-green-600' : 'text-blue-600'}`}>
          알바체크
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {userRole === 'employer' ? '고용주 모드' : '근태 및 급여 관리'}
        </p>
      </div>

      <div className="space-y-1 flex-1">
        {menuItems.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${isActive(item.id)}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="mb-3 px-4">
          <span className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium ${
            userRole === 'employer' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {userRole === 'employer' ? '🏪 고용주' : '👷 알바생'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
        >
          <LogOut size={20} />
          로그아웃
        </button>
      </div>
    </nav>
  )
}
