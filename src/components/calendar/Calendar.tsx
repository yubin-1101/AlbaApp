import React, { useState } from 'react';
import { DayCell } from './DayCell';
import { MonthSelector } from './MonthSelector';
import './Calendar.css';

interface WorkRecord {
  id: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  workHours?: number;
  dailySalary?: number;
}

interface CalendarProps {
  workRecords: WorkRecord[];
  onDateClick: (date: string) => void;
  currentMonth?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({
  workRecords,
  onDateClick,
  currentMonth = new Date(),
}) => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const getWorkRecordForDate = (date: string) => {
    return workRecords.find(record => record.date === date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'prev' ? -1 : 1));
      return newMonth;
    });
  };

  // MonthSelector에서 받은 Date로 바로 설정
  const handleMonthSelect = (date: Date) => {
    setSelectedMonth(date);
    setShowMonthSelector(false);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedMonth);
  const monthName = selectedMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

  const renderCalendarDays = () => {
    const days = [];

    // 이전 달 빈칸
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="day-cell empty"></div>);
    }

    // 실제 날짜
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const workRecord = getWorkRecordForDate(dateString);
      days.push(
        <DayCell
          key={day}
          day={day}
          workRecord={workRecord}
          onClick={() => onDateClick(dateString)}
        />
      );
    }

    return days;
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={() => navigateMonth('prev')}></button>
        <h2 className="calendar-title" onClick={() => setShowMonthSelector(!showMonthSelector)}>
          {monthName}
        </h2>
        <button onClick={() => navigateMonth('next')}></button>
      </div>

      {showMonthSelector && (
        <MonthSelector
          selectedDate={selectedMonth}
          onMonthSelect={handleMonthSelect}
        />
      )}

      <div className="calendar-weekdays">
        {['일','월','화','수','목','금','토'].map(d => (
          <div key={d} className="weekday">{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {renderCalendarDays()}
      </div>
    </div>
  );
};
