import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

type UserRole = 'employee' | 'employer' | null

interface LoginPageProps {
  onLogin: (role: UserRole) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState<'selection' | 'employee-login' | 'employer-login' | 'employee-register' | 'employer-register'>('selection')
  const [name, setName] = useState('')
  const [branchCode, setBranchCode] = useState('')
  const [branchName, setBranchName] = useState('')

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!email || !password) {
        setError('이메일과 비밀번호를 입력해주세요')
        setLoading(false)
        return
      }

      // 개발/테스트 모드: 로컬 스토리지 사용
      const isDemoMode = email === 'test@example.com' || password === 'password123'
      
      if (isDemoMode) {
        localStorage.setItem('alba_user', JSON.stringify({ 
          email, 
          role: 'employee',
          userId: 'demo-user-' + Math.random().toString(36).substr(2, 9),
          name: '테스트 근로자',
          timestamp: new Date().toISOString() 
        }))
        onLogin('employee')
        return
      }

      // 실제 Supabase 연결
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (data.user) {
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select('status')
          .eq('user_id', data.user.id)
          .single()

        if (employeeError) {
          throw new Error('직원 정보를 불러오는데 실패했습니다.')
        }

        if (employee.status === 'pending') {
          await supabase.auth.signOut()
          throw new Error('고용주의 승인을 기다려주세요.')
        } else if (employee.status === 'approved') {
          localStorage.setItem('alba_user', JSON.stringify({ 
            email, 
            role: 'employee',
            userId: data.user.id,
            timestamp: new Date().toISOString() 
          }))
          onLogin('employee')
        }
      }
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleEmployerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!email || !password) {
        setError('이메일과 비밀번호를 입력해주세요')
        setLoading(false)
        return
      }

      // 개발/테스트 모드: 로컬 스토리지 사용
      const isDemoMode = email === 'employer@example.com' || password === 'password123'
      
      if (isDemoMode) {
        localStorage.setItem('alba_user', JSON.stringify({ 
          email, 
          role: 'employer',
          userId: 'demo-employer-' + Math.random().toString(36).substr(2, 9),
          branchName: '테스트 지점',
          timestamp: new Date().toISOString() 
        }))
        onLogin('employer')
        return
      }

      // 실제 Supabase 연결
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (data.user) {
        const { data: branch } = await supabase
          .from('branches')
          .select('id')
          .eq('employer_id', data.user.id)
          .single()

        if (!branch) {
          await supabase.auth.signOut()
          throw new Error('고용주 정보를 찾을 수 없습니다.')
        }

        localStorage.setItem('alba_user', JSON.stringify({ 
          email, 
          role: 'employer',
          userId: data.user.id,
          timestamp: new Date().toISOString() 
        }))
        onLogin('employer')
      }
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!email || !password || !name || !branchCode) {
        setError('모든 필드를 입력해주세요')
        setLoading(false)
        return
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      if (data.user) {
        const { error: insertError } = await supabase
          .from('employees')
          .insert({
            user_id: data.user.id,
            name,
            branch_code: branchCode,
            status: 'pending',
          })

        if (insertError) throw insertError

        setError('')
        alert('회원가입이 완료되었습니다. 고용주의 승인을 기다려주세요.')
        setView('employee-login')
      }
    } catch (err: any) {
      setError(err.message || '회원가입 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleEmployerRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!email || !password || !branchName) {
        setError('모든 필드를 입력해주세요')
        setLoading(false)
        return
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      if (data.user) {
        const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        
        const { error: insertError } = await supabase
          .from('branches')
          .insert({
            employer_id: data.user.id,
            name: branchName,
            branch_code: generatedCode,
          })

        if (insertError) throw insertError

        setError('')
        alert(`회원가입이 완료되었습니다.\n지점 코드: ${generatedCode}\n직원들에게 이 코드를 공유해주세요.`)
        setView('employer-login')
      }
    } catch (err: any) {
      setError(err.message || '회원가입 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 선택 화면
  if (view === 'selection') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
        <div className="bg-white rounded-lg shadow-xl p-8 w-96">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">알바체크</h1>
          <p className="text-center text-gray-600 mb-8">근태 및 급여 관리 플랫폼</p>
          
          <p className="text-center text-gray-700 mb-6">어떤 유형으로 로그인/회원가입 하시겠어요?</p>
          
          <div className="space-y-3">
            <button
              onClick={() => setView('employee-login')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              👷 알바생
            </button>
            <button
              onClick={() => setView('employer-login')}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              🏪 고용주
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 알바생 로그인
  if (view === 'employee-login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
        <div className="bg-white rounded-lg shadow-xl p-8 w-96">
          <button onClick={() => setView('selection')} className="text-gray-500 hover:text-gray-700 mb-4">
            ← 뒤로
          </button>
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">알바생 로그인</h1>

          <form onSubmit={handleEmployeeLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-4 space-y-3">
            <div className="text-center">
              <button
                onClick={() => { setView('employee-register'); setError('') }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                계정이 없나요? 회원가입
              </button>
            </div>
            
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2">💡 테스트 로그인</p>
              <button
                type="button"
                onClick={() => {
                  setEmail('test@example.com')
                  setPassword('password123')
                  setTimeout(() => {
                    handleEmployeeLogin(new Event('submit') as any)
                  }, 100)
                }}
                className="w-full bg-gray-200 text-gray-800 py-1.5 rounded text-sm hover:bg-gray-300 transition"
              >
                테스트 계정으로 접속
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 고용주 로그인
  if (view === 'employer-login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
        <div className="bg-white rounded-lg shadow-xl p-8 w-96">
          <button onClick={() => setView('selection')} className="text-gray-500 hover:text-gray-700 mb-4">
            ← 뒤로
          </button>
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">고용주 로그인</h1>

          <form onSubmit={handleEmployerLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-4 space-y-3">
            <div className="text-center">
              <button
                onClick={() => { setView('employer-register'); setError('') }}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                계정이 없나요? 회원가입
              </button>
            </div>
            
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2">💡 테스트 로그인</p>
              <button
                type="button"
                onClick={() => {
                  setEmail('employer@example.com')
                  setPassword('password123')
                  setTimeout(() => {
                    handleEmployerLogin(new Event('submit') as any)
                  }, 100)
                }}
                className="w-full bg-gray-200 text-gray-800 py-1.5 rounded text-sm hover:bg-gray-300 transition"
              >
                테스트 계정으로 접속
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 알바생 회원가입
  if (view === 'employee-register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
        <div className="bg-white rounded-lg shadow-xl p-8 w-96">
          <button onClick={() => setView('employee-login')} className="text-gray-500 hover:text-gray-700 mb-4">
            ← 뒤로
          </button>
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">알바생 회원가입</h1>

          <form onSubmit={handleEmployeeRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">지점 코드</label>
              <input
                type="text"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="고용주에게 받은 지점 코드"
              />
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 고용주 회원가입
  if (view === 'employer-register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
        <div className="bg-white rounded-lg shadow-xl p-8 w-96">
          <button onClick={() => setView('employer-login')} className="text-gray-500 hover:text-gray-700 mb-4">
            ← 뒤로
          </button>
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">고용주 회원가입</h1>

          <form onSubmit={handleEmployerRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">지점명</label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="지점/매장 이름을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return null
}
