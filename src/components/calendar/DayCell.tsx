import React from 'react';
import './DayCell.css';

interface WorkRecord {
  id: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  workHours?: number;
  dailySalary?: number;
}

interface DayCellProps {
  day: number;
  workRecord?: WorkRecord;
  onClick: () => void;
}

export const DayCell: React.FC<DayCellProps> = ({
  day,
  workRecord,
  onClick,
}) => {
  const hasWorkRecord = !!workRecord;
  const isToday = new Date().toDateString() === new Date(workRecord?.date || '').toDateString();

  const getWorkStatus = () => {
    if (!workRecord) return 'no-work';
    if (workRecord.clockIn && workRecord.clockOut) return 'completed';
    if (workRecord.clockIn && !workRecord.clockOut) return 'in-progress';
    return 'no-work';
  };

  const getWorkHoursText = () => {
    if (!workRecord?.workHours) return '';
    return `${workRecord.workHours.toFixed(1)}h`;
  };

  const getSalaryText = () => {
    if (!workRecord?.dailySalary) return '';
    return `₩${workRecord.dailySalary.toLocaleString()}`;
  };

  const cellClasses = [
    'day-cell',
    hasWorkRecord ? 'has-work' : '',
    `work-status-${getWorkStatus()}`,
    isToday ? 'today' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cellClasses} onClick={onClick}>
      <div className="day-number">{day}</div>
      {hasWorkRecord && (
        <div className="work-info">
          <div className="work-hours">{getWorkHoursText()}</div>
          <div className="work-salary">{getSalaryText()}</div>
        </div>
      )}
    </div>
  );
};
