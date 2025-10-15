import React from 'react';
import './SalaryChart.css';

interface SalaryData {
  month: string;
  totalSalary: number;
  totalHours: number;
  netSalary: number;
}

interface SalaryChartProps {
  data: SalaryData[];
  period: 'monthly' | 'weekly';
  onPeriodChange: (period: 'monthly' | 'weekly') => void;
}

export const SalaryChart: React.FC<SalaryChartProps> = ({
  data,
  period,
  onPeriodChange,
}) => {
  const maxSalary = Math.max(...data.map(d => d.totalSalary), 0);
  const maxHours = Math.max(...data.map(d => d.totalHours), 0);

  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  const getBarHeight = (value: number, maxValue: number) => {
    if (maxValue === 0) return 0;
    return (value / maxValue) * 100;
  };

  const getBarColor = (index: number) => {
    const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE'];
    return colors[index % colors.length];
  };

  return (
    <div className="salary-chart">
      <div className="chart-header">
        <h3 className="chart-title">급여 통계</h3>
        <div className="period-selector">
          <button
            className={`period-button ${period === 'monthly' ? 'active' : ''}`}
            onClick={() => onPeriodChange('monthly')}
          >
            월별
          </button>
          <button
            className={`period-button ${period === 'weekly' ? 'active' : ''}`}
            onClick={() => onPeriodChange('weekly')}
          >
            주별
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="no-data">
          <p>데이터가 없습니다.</p>
        </div>
      ) : (
        <div className="chart-container">
          <div className="chart-bars">
            {data.map((item, index) => (
              <div key={item.month} className="chart-bar-group">
                <div className="bar-container">
                  <div
                    className="salary-bar"
                    style={{
                      height: `${getBarHeight(item.totalSalary, maxSalary)}%`,
                      backgroundColor: getBarColor(index),
                    }}
                    title={`${item.month}: ${formatCurrency(item.totalSalary)}`}
                  />
                  <div
                    className="hours-bar"
                    style={{
                      height: `${getBarHeight(item.totalHours, maxHours)}%`,
                      backgroundColor: getBarColor(index),
                      opacity: 0.6,
                    }}
                    title={`${item.month}: ${formatHours(item.totalHours)}`}
                  />
                </div>
                <div className="bar-label">{item.month}</div>
                <div className="bar-values">
                  <div className="salary-value">{formatCurrency(item.totalSalary)}</div>
                  <div className="hours-value">{formatHours(item.totalHours)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color salary-color"></div>
              <span>총 급여</span>
            </div>
            <div className="legend-item">
              <div className="legend-color hours-color"></div>
              <span>근무 시간</span>
            </div>
          </div>

          <div className="chart-summary">
            <div className="summary-item">
              <div className="summary-label">총 급여</div>
              <div className="summary-value total-salary">
                {formatCurrency(data.reduce((sum, item) => sum + item.totalSalary, 0))}
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-label">총 근무 시간</div>
              <div className="summary-value total-hours">
                {formatHours(data.reduce((sum, item) => sum + item.totalHours, 0))}
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-label">평균 시급</div>
              <div className="summary-value avg-hourly">
                {formatCurrency(
                  data.reduce((sum, item) => sum + item.totalSalary, 0) /
                  Math.max(data.reduce((sum, item) => sum + item.totalHours, 0), 1)
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
