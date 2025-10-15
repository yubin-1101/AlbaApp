import React, { useState } from 'react';
import './WorkHistory.css';

interface WorkRecord {
  id: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  workHours?: number;
  dailySalary?: number;
  location?: string;
}

interface WorkHistoryProps {
  workRecords: WorkRecord[];
  onRecordClick: (record: WorkRecord) => void;
}

export const WorkHistory: React.FC<WorkHistoryProps> = ({
  workRecords,
  onRecordClick,
}) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');

  const filteredRecords = workRecords.filter(record => {
    switch (filter) {
      case 'completed':
        return record.clockOut;
      case 'in-progress':
        return !record.clockOut;
      default:
        return true;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWorkStatus = (record: WorkRecord) => {
    if (record.clockOut) return 'completed';
    if (record.clockIn) return 'in-progress';
    return 'no-work';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'in-progress':
        return '근무 중';
      default:
        return '미출근';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      default:
        return 'status-no-work';
    }
  };

  return (
    <div className="work-history">
      <div className="history-header">
        <h3 className="history-title">근무 이력</h3>
        <div className="filter-buttons">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            전체
          </button>
          <button
            className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            완료
          </button>
          <button
            className={`filter-button ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            근무 중
          </button>
        </div>
      </div>

      <div className="history-list">
        {filteredRecords.length === 0 ? (
          <div className="no-records">
            <p>근무 기록이 없습니다.</p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const status = getWorkStatus(record);
            return (
              <div
                key={record.id}
                className="history-item"
                onClick={() => onRecordClick(record)}
              >
                <div className="item-date">
                  {formatDate(record.date)}
                </div>
                <div className="item-time">
                  <div className="time-range">
                    {formatTime(record.clockIn)}
                    {record.clockOut && (
                      <>
                        <span className="time-separator">~</span>
                        {formatTime(record.clockOut)}
                      </>
                    )}
                  </div>
                  {record.workHours && (
                    <div className="work-hours">
                      {record.workHours.toFixed(1)}시간
                    </div>
                  )}
                </div>
                <div className="item-location">
                  {record.location || '장소 미지정'}
                </div>
                <div className="item-salary">
                  {record.dailySalary ? `₩${record.dailySalary.toLocaleString()}` : '-'}
                </div>
                <div className={`item-status ${getStatusClass(status)}`}>
                  {getStatusText(status)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
