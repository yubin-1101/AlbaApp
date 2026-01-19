import { useState, useEffect } from 'react'
import { QrCode, Camera, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import QRCode from 'react-qr-code'

interface QRPageProps {
  userRole: 'employee' | 'employer' | null
}

export default function QRPage({ userRole }: QRPageProps) {
  if (userRole === 'employer') {
    return <EmployerQRView />
  }
  return <EmployeeQRView />
}

// 고용주용 QR 코드 생성 뷰
function EmployerQRView() {
  const [qrData, setQrData] = useState<{ branchId: string; token: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // 현재 시간 업데이트
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    generateQRCode()
  }, [])

  const generateQRCode = () => {
    setLoading(true)
    // 데모 모드: 로컬에서 QR 코드 생성
    const demoQrData = {
      branchId: 'demo-branch-' + Math.random().toString(36).substr(2, 9),
      token: Math.random().toString(36).substring(2, 15),
    }
    
    setTimeout(() => {
      setQrData(demoQrData)
      setLoading(false)
    }, 500)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">출퇴근 QR 코드</h1>
          <p className="text-gray-600 mt-2">직원들에게 이 QR 코드를 보여주세요</p>
        </div>

        {/* 현재 시간 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
            <Clock size={18} />
            <span className="text-sm">{formatDate(currentTime)}</span>
          </div>
          <div className="text-4xl font-bold text-center text-gray-800">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* QR 코드 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : qrData ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl border-4 border-green-100">
                <QRCode
                  value={JSON.stringify(qrData)}
                  size={200}
                  level="H"
                />
              </div>
              <p className="mt-4 text-sm text-gray-500">
                QR 코드는 매일 자정에 자동 갱신됩니다
              </p>
              <button
                onClick={generateQRCode}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
              >
                <RefreshCw size={16} />
                새로고침
              </button>
            </div>
          ) : (
            <div className="text-center text-red-500">
              QR 코드를 생성할 수 없습니다
            </div>
          )}
        </div>

        {/* 안내 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            💡 <strong>안내:</strong> 직원이 이 QR 코드를 스캔하면 자동으로 출퇴근이 기록됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}

// 알바생용 QR 스캐너 뷰
function EmployeeQRView() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [todayRecord, setTodayRecord] = useState<{ clockIn: string | null; clockOut: string | null }>({
    clockIn: null,
    clockOut: null
  })
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // 로컬 스토리지에서 오늘 기록 확인
    const today = new Date().toISOString().split('T')[0]
    const savedRecord = localStorage.getItem(`attendance_${today}`)
    if (savedRecord) {
      setTodayRecord(JSON.parse(savedRecord))
    }

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })
  }

  const handleClockAction = (type: 'clock-in' | 'clock-out') => {
    setScanning(true)
    // 데모: 2초 후 성공 처리
    setTimeout(() => {
      const now = new Date()
      const timeStr = formatTime(now)
      const today = now.toISOString().split('T')[0]
      const newRecord = {
        ...todayRecord,
        [type === 'clock-in' ? 'clockIn' : 'clockOut']: timeStr
      }
      setTodayRecord(newRecord)
      localStorage.setItem(`attendance_${today}`, JSON.stringify(newRecord))
      setResult({
        success: true,
        message: type === 'clock-in' 
          ? `출근이 완료되었습니다! (${timeStr})`
          : `퇴근이 완료되었습니다! (${timeStr})`
      })
      setScanning(false)
    }, 2000)
  }

  const resetState = () => {
    setResult(null)
    setScanning(false)
  }

  // 스캔 중 화면
  if (scanning) {
    return (
      <div className="min-h-full bg-gray-900 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-64 h-64 border-4 border-white rounded-2xl flex items-center justify-center">
              <Camera className="w-16 h-16 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 border-2 border-blue-400 rounded-2xl animate-ping"></div>
          </div>
          <p className="text-white text-lg mb-4">QR 코드를 스캔하고 있습니다...</p>
          <button
            onClick={resetState}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            취소
          </button>
        </div>
      </div>
    )
  }

  // 결과 화면
  if (result) {
    return (
      <div className={`min-h-full flex items-center justify-center p-8 ${
        result.success ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-rose-500'
      }`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6">
            {result.success ? (
              <CheckCircle className="w-12 h-12 text-green-500" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {result.success ? '성공!' : '실패'}
          </h2>
          <p className="text-white/90 mb-8">{result.message}</p>
          <button
            onClick={resetState}
            className="px-8 py-3 bg-white text-gray-800 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            확인
          </button>
        </div>
      </div>
    )
  }

  // 메인 화면
  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">QR 출퇴근</h1>
          <p className="text-gray-600 mt-2">QR 코드를 스캔하여 출퇴근하세요</p>
        </div>

        {/* 현재 시간 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
            <Clock size={18} />
            <span className="text-sm">{formatDate(currentTime)}</span>
          </div>
          <div className="text-4xl font-bold text-center text-gray-800">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* 오늘의 출퇴근 기록 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">오늘의 기록</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${todayRecord.clockIn ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <p className="text-sm text-gray-500">출근</p>
              <p className={`text-xl font-bold ${todayRecord.clockIn ? 'text-green-600' : 'text-gray-400'}`}>
                {todayRecord.clockIn || '--:--:--'}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${todayRecord.clockOut ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
              <p className="text-sm text-gray-500">퇴근</p>
              <p className={`text-xl font-bold ${todayRecord.clockOut ? 'text-blue-600' : 'text-gray-400'}`}>
                {todayRecord.clockOut || '--:--:--'}
              </p>
            </div>
          </div>
        </div>

        {/* 출퇴근 버튼 */}
        <div className="space-y-4">
          <button
            onClick={() => handleClockAction('clock-in')}
            disabled={!!todayRecord.clockIn}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-3 ${
              todayRecord.clockIn
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
            }`}
          >
            <Camera size={24} />
            {todayRecord.clockIn ? '출근 완료' : 'QR 스캔하여 출근'}
          </button>
          
          <button
            onClick={() => handleClockAction('clock-out')}
            disabled={!todayRecord.clockIn || !!todayRecord.clockOut}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-3 ${
              !todayRecord.clockIn || todayRecord.clockOut
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl'
            }`}
          >
            <Camera size={24} />
            {todayRecord.clockOut ? '퇴근 완료' : 'QR 스캔하여 퇴근'}
          </button>
        </div>

        {/* 안내 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>안내:</strong> 매장에 비치된 QR 코드를 스캔하면 자동으로 출퇴근이 기록됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}
