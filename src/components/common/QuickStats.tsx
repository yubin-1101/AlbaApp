import React from 'react';
import './QuickStats.css';

interface StatItem {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  color?: string;
}

interface QuickStatsProps {
  title: string;
  stats: StatItem[];
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  title,
  stats,
  variant = 'default'
}) => {
  return (
    <div className={`quick-stats ${variant}`}>
      <h3 className="quick-stats-title">{title}</h3>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {stat.value}
                {stat.unit && <span className="stat-unit">{stat.unit}</span>}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
