import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import './ClockInOut.css';

interface ClockInOutProps {
  onClockIn: (location: string) => void;
  onClockOut: () => void;
  isClockedIn: boolean;
  currentWorkRecord?: {
    clockIn: string;
    workHours?: number;
  };
}

export const ClockInOut: React.FC<ClockInOutProps> = ({
  onClockIn,
  onClockOut,
  isClockedIn,
  currentWorkRecord,
}) => {
  const [location, setLocation] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    if (!location.trim()) {
      alert('근무 장소를 입력해주세요.');
      return;
    }
    onClockIn(location.trim());
  };

  const handleClockOut = () => {
    if (window.confirm('퇴근하시겠습니까?')) {
      onClockOut();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const getWorkDuration = () => {
    if (!currentWorkRecord?.clockIn) return '00:00:00';
    
    const startTime = new Date(currentWorkRecord.clockIn);
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="clock-in-out">
      <div className="time-display">
        <div className="current-time">{formatTime(currentTime)}</div>
        <div className="current-date">{formatDate(currentTime)}</div>
      </div>

      {isClockedIn && currentWorkRecord && (
        <div className="work-status">
          <div className="status-indicator working">근무 중</div>
          <div className="work-duration">
            근무 시간: {getWorkDuration()}
          </div>
          <div className="clock-in-time">
            출근 시간: {formatTime(new Date(currentWorkRecord.clockIn))}
          </div>
        </div>
      )}

      {!isClockedIn && (
        <div className="clock-in-form">
          <div className="location-input">
            <label htmlFor="location">근무 장소</label>
            <input
              id="location"
              type="text"
              placeholder="근무할 장소를 입력하세요"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="location-field"
            />
          </div>
          <Button
            title="출근하기"
            onClick={handleClockIn}
            variant="primary"
            size="large"
            className="clock-in-button"
          />
        </div>
      )}

      {isClockedIn && (
        <div className="clock-out-section">
          <Button
            title="퇴근하기"
            onClick={handleClockOut}
            variant="secondary"
            size="large"
            className="clock-out-button"
          />
        </div>
      )}
    </div>
  );
};
