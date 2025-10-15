import React, { useState } from 'react';
import './MonthSelector.css';

interface MonthSelectorProps {
  selectedDate: Date;
  onMonthSelect: (date: Date) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedDate, onMonthSelect }) => {
  const [year, setYear] = useState(selectedDate.getFullYear());
  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  return (
    <div className="month-selector">
      <div className="year-header">
        <button onClick={() => setYear(y => y - 1)}>‹</button>
        <span>{year}</span>
        <button onClick={() => setYear(y => y + 1)}>›</button>
      </div>
      <div className="month-grid">
        {months.map((m, i) => (
          <button key={i} onClick={() => onMonthSelect(new Date(year, i))} className="month-button">
            {m}
          </button>
        ))}
      </div>
    </div>
  );
};
