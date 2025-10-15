import React, { useState, useEffect } from 'react';
import { Input } from '../common/Input';
import './TaxCalculator.css';

interface TaxCalculation {
  grossSalary: number;
  nationalPension: number;
  healthInsurance: number;
  employmentInsurance: number;
  incomeTax: number;
  totalDeductions: number;
  netSalary: number;
}

interface TaxCalculatorProps {
  monthlySalary: number;
  onCalculationChange: (calculation: TaxCalculation) => void;
}

const TAX_RATES = {
  nationalPension: 0.045, // 국민연금 4.5%
  healthInsurance: 0.0343, // 건강보험 3.43%
  employmentInsurance: 0.008, // 고용보험 0.8%
  incomeTax: 0.06, // 소득세 6% (간이세율)
};

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({
  monthlySalary,
  onCalculationChange,
}) => {
  const [calculation, setCalculation] = useState<TaxCalculation>({
    grossSalary: monthlySalary,
    nationalPension: 0,
    healthInsurance: 0,
    employmentInsurance: 0,
    incomeTax: 0,
    totalDeductions: 0,
    netSalary: 0,
  });

  const [customRates, setCustomRates] = useState({
    nationalPension: TAX_RATES.nationalPension * 100,
    healthInsurance: TAX_RATES.healthInsurance * 100,
    employmentInsurance: TAX_RATES.employmentInsurance * 100,
    incomeTax: TAX_RATES.incomeTax * 100,
  });

  useEffect(() => {
    calculateTaxes();
  }, [monthlySalary, customRates]);

  const calculateTaxes = () => {
    const grossSalary = monthlySalary;
    
    const nationalPension = grossSalary * (customRates.nationalPension / 100);
    const healthInsurance = grossSalary * (customRates.healthInsurance / 100);
    const employmentInsurance = grossSalary * (customRates.employmentInsurance / 100);
    const incomeTax = grossSalary * (customRates.incomeTax / 100);
    
    const totalDeductions = nationalPension + healthInsurance + employmentInsurance + incomeTax;
    const netSalary = grossSalary - totalDeductions;

    const newCalculation: TaxCalculation = {
      grossSalary,
      nationalPension,
      healthInsurance,
      employmentInsurance,
      incomeTax,
      totalDeductions,
      netSalary,
    };

    setCalculation(newCalculation);
    onCalculationChange(newCalculation);
  };

  const handleRateChange = (field: keyof typeof customRates, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomRates(prev => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const resetToDefaultRates = () => {
    setCustomRates({
      nationalPension: TAX_RATES.nationalPension * 100,
      healthInsurance: TAX_RATES.healthInsurance * 100,
      employmentInsurance: TAX_RATES.employmentInsurance * 100,
      incomeTax: TAX_RATES.incomeTax * 100,
    });
  };

  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  return (
    <div className="tax-calculator">
      <div className="calculator-header">
        <h3 className="calculator-title">세금 계산기</h3>
        <button
          className="reset-button"
          onClick={resetToDefaultRates}
        >
          기본 세율로 복원
        </button>
      </div>

      <div className="calculator-content">
        <div className="gross-salary-section">
          <h4>월 급여</h4>
          <div className="gross-salary-display">
            {formatCurrency(monthlySalary)}
          </div>
        </div>

        <div className="tax-rates-section">
          <h4>세율 설정</h4>
          <div className="rates-grid">
            <div className="rate-item">
              <label htmlFor="nationalPension">국민연금 (%)</label>
              <input
                id="nationalPension"
                type="number"
                step="0.01"
                value={customRates.nationalPension}
                onChange={(e) => handleRateChange('nationalPension', e.target.value)}
                className="rate-input"
              />
            </div>
            <div className="rate-item">
              <label htmlFor="healthInsurance">건강보험 (%)</label>
              <input
                id="healthInsurance"
                type="number"
                step="0.01"
                value={customRates.healthInsurance}
                onChange={(e) => handleRateChange('healthInsurance', e.target.value)}
                className="rate-input"
              />
            </div>
            <div className="rate-item">
              <label htmlFor="employmentInsurance">고용보험 (%)</label>
              <input
                id="employmentInsurance"
                type="number"
                step="0.01"
                value={customRates.employmentInsurance}
                onChange={(e) => handleRateChange('employmentInsurance', e.target.value)}
                className="rate-input"
              />
            </div>
            <div className="rate-item">
              <label htmlFor="incomeTax">소득세 (%)</label>
              <input
                id="incomeTax"
                type="number"
                step="0.01"
                value={customRates.incomeTax}
                onChange={(e) => handleRateChange('incomeTax', e.target.value)}
                className="rate-input"
              />
            </div>
          </div>
        </div>

        <div className="calculation-results">
          <h4>공제 내역</h4>
          <div className="deductions-list">
            <div className="deduction-item">
              <span className="deduction-label">국민연금</span>
              <span className="deduction-amount">
                {formatCurrency(calculation.nationalPension)}
              </span>
              <span className="deduction-rate">
                {formatPercentage(customRates.nationalPension)}
              </span>
            </div>
            <div className="deduction-item">
              <span className="deduction-label">건강보험</span>
              <span className="deduction-amount">
                {formatCurrency(calculation.healthInsurance)}
              </span>
              <span className="deduction-rate">
                {formatPercentage(customRates.healthInsurance)}
              </span>
            </div>
            <div className="deduction-item">
              <span className="deduction-label">고용보험</span>
              <span className="deduction-amount">
                {formatCurrency(calculation.employmentInsurance)}
              </span>
              <span className="deduction-rate">
                {formatPercentage(customRates.employmentInsurance)}
              </span>
            </div>
            <div className="deduction-item">
              <span className="deduction-label">소득세</span>
              <span className="deduction-amount">
                {formatCurrency(calculation.incomeTax)}
              </span>
              <span className="deduction-rate">
                {formatPercentage(customRates.incomeTax)}
              </span>
            </div>
          </div>

          <div className="total-deductions">
            <span className="total-label">총 공제액</span>
            <span className="total-amount">
              {formatCurrency(calculation.totalDeductions)}
            </span>
          </div>

          <div className="net-salary">
            <span className="net-label">실수령액</span>
            <span className="net-amount">
              {formatCurrency(calculation.netSalary)}
            </span>
          </div>
        </div>

        <div className="calculator-info">
          <h4>참고사항</h4>
          <ul className="info-list">
            <li>국민연금: 월 급여의 4.5% (근로자 부담분)</li>
            <li>건강보험: 월 급여의 3.43% (근로자 부담분)</li>
            <li>고용보험: 월 급여의 0.8% (근로자 부담분)</li>
            <li>소득세: 간이세율 기준으로 계산 (실제 세율은 다를 수 있음)</li>
            <li>세율은 개별 상황에 따라 달라질 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
