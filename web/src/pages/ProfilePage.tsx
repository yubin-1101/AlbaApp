import { useState, useEffect } from 'react'
import { User, Mail, Building2, Calendar, Bell, Shield, ChevronRight, Edit3, Moon, Sun } from 'lucide-react'

interface ProfileData {
  email: string
  name?: string
  branchName?: string
  branchCode?: string
  role: 'employee' | 'employer'
  status?: string
  createdAt?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      // 로컬 스토리지에서 데모 유저 정보 로드
      const localUser = localStorage.getItem('alba_user')
      if (localUser) {
        const userData = JSON.parse(localUser)
        setProfile({
          email: userData.email || 'test@example.com',
          name: userData.name || '테스트 사용자',
          role: userData.role || 'employee',
          branchName: userData.branchName || '테스트 지점',
          branchCode: userData.branchCode || 'TEST01',
          status: 'approved',
          createdAt: userData.timestamp || new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-700">프로필을 불러올 수 없습니다.</div>
      </div>
    )
  }

  const isEmployer = profile.role === 'employer'

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* 프로필 헤더 */}
        <div className={`rounded-3xl p-8 mb-6 ${
          isEmployer 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
        }`}>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {(profile.name || profile.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition">
                <Edit3 size={14} className="text-gray-600" />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {profile.name || profile.email?.split('@')[0] || '사용자'}
              </h1>
              <p className="text-white/80 mt-1">{profile.email}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                {isEmployer ? '🏪 고용주' : '👷 알바생'}
              </span>
            </div>
          </div>
        </div>

        {/* 정보 카드 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">기본 정보</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            <InfoRow 
              icon={<Mail size={20} />}
              label="이메일"
              value={profile.email}
              color="blue"
            />
            <InfoRow 
              icon={<User size={20} />}
              label="이름"
              value={profile.name || '-'}
              color="blue"
            />
            <InfoRow 
              icon={<Building2 size={20} />}
              label={isEmployer ? '매장명' : '근무지'}
              value={profile.branchName || '-'}
              color="blue"
            />
            {isEmployer && profile.branchCode && (
              <InfoRow 
                icon={<Shield size={20} />}
                label="지점 코드"
                value={profile.branchCode}
                color="purple"
                mono
              />
            )}
            {profile.status && (
              <div className="flex items-center gap-4 p-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  profile.status === 'approved' ? 'bg-green-50' : 'bg-yellow-50'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    profile.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">상태</p>
                  <p className={`font-medium ${
                    profile.status === 'approved' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {profile.status === 'approved' ? '✓ 승인됨' : '⏳ 승인 대기 중'}
                  </p>
                </div>
              </div>
            )}
            <InfoRow 
              icon={<Calendar size={20} />}
              label="가입일"
              value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR')}
              color="blue"
            />
          </div>
        </div>

        {/* 설정 카드 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">설정</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            <SettingRow 
              icon={<Bell size={20} />}
              label="알림 설정"
              toggle
              value={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            <SettingRow 
              icon={darkMode ? <Moon size={20} /> : <Sun size={20} />}
              label="다크 모드"
              toggle
              value={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <SettingRow 
              icon={<Shield size={20} />}
              label="개인정보 보호"
              arrow
            />
          </div>
        </div>

        {/* 계정 관리 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">계정</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                <Edit3 size={20} />
              </div>
              <span className="flex-1 text-left text-gray-700">프로필 수정</span>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
            
            <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                <Shield size={20} />
              </div>
              <span className="flex-1 text-left text-gray-700">비밀번호 변경</span>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* 앱 정보 */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>알바체크 v1.0.0</p>
          <p className="mt-1">© 2024 Alba Check. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value, color, mono }: { 
  icon: React.ReactNode
  label: string
  value: string
  color: string
  mono?: boolean
}) {
  const colorClasses: { [key: string]: string } = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
  }

  return (
    <div className="flex items-center gap-4 p-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-gray-800 font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  )
}

function SettingRow({ 
  icon, 
  label, 
  toggle, 
  arrow, 
  value, 
  onChange 
}: { 
  icon: React.ReactNode
  label: string
  toggle?: boolean
  arrow?: boolean
  value?: boolean
  onChange?: () => void
}) {
  return (
    <button 
      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition"
      onClick={onChange}
    >
      <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
        {icon}
      </div>
      <span className="flex-1 text-left text-gray-700">{label}</span>
      {toggle && (
        <div className={`w-12 h-6 rounded-full transition ${value ? 'bg-blue-500' : 'bg-gray-300'}`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${value ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
        </div>
      )}
      {arrow && <ChevronRight size={20} className="text-gray-400" />}
    </button>
  )
}
