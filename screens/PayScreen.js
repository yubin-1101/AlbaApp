import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, TextInput, Button, DataTable, Caption } from 'react-native-paper';

// 2024년 기준 4대 보험 요율 (근로자 부담분, 단순화된 시뮬레이션)
const NATIONAL_PENSION_RATE = 0.045; // 국민연금 4.5%
const HEALTH_INSURANCE_RATE = 0.03545; // 건강보험 3.545%
const LONG_TERM_CARE_RATE = 0.1295; // 장기요양보험 (건강보험료의 12.95%)
const EMPLOYMENT_INSURANCE_RATE = 0.009; // 고용보험 0.9%

// 소득세 및 지방소득세 (매우 단순화된 시뮬레이션)
const INCOME_TAX_SIMPLIFIED_RATE = 0.03; // 예시: 3%
const LOCAL_INCOME_TAX_RATE = 0.1; // 소득세의 10%

const AVERAGE_WEEKS_IN_MONTH = 4.345; // 월 평균 주 수

const PayScreen = () => {
  const [hourlyWage, setHourlyWage] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('');
  const [monthlyWorkingDays, setMonthlyWorkingDays] = useState('');

  const [monthlyGrossPay, setMonthlyGrossPay] = useState(0);
  const [monthlyWeeklyHolidayPay, setMonthlyWeeklyHolidayPay] = useState(0);
  const [nationalPensionDeduction, setNationalPensionDeduction] = useState(0);
  const [healthInsuranceDeduction, setHealthInsuranceDeduction] = useState(0);
  const [employmentInsuranceDeduction, setEmploymentInsuranceDeduction] = useState(0);
  const [incomeTaxDeduction, setIncomeTaxDeduction] = useState(0);
  const [localIncomeTaxDeduction, setLocalIncomeTaxDeduction] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [monthlyNetPay, setMonthlyNetPay] = useState(0);

  const calculatePay = () => {
    const wage = parseFloat(hourlyWage);
    const wHours = parseFloat(weeklyHours);
    const mDays = parseFloat(monthlyWorkingDays);

    if (isNaN(wage) || isNaN(wHours) || isNaN(mDays) || wage <= 0 || wHours <= 0 || mDays <= 0) {
      Alert.alert('입력 오류', '시급, 주간 근무 시간, 월간 근무 일수를 올바르게 입력해주세요.');
      return;
    }

    const monthlyTotalHours = wHours * AVERAGE_WEEKS_IN_MONTH;
    let calculatedMonthlyWeeklyHolidayPay = 0;
    if (wHours >= 15) {
      calculatedMonthlyWeeklyHolidayPay = Math.floor((wHours / 40) * 8 * wage * AVERAGE_WEEKS_IN_MONTH);
    }
    setMonthlyWeeklyHolidayPay(calculatedMonthlyWeeklyHolidayPay);

    const calculatedMonthlyGrossPay = Math.floor((wage * monthlyTotalHours) + calculatedMonthlyWeeklyHolidayPay);
    setMonthlyGrossPay(calculatedMonthlyGrossPay);

    const np = Math.floor(calculatedMonthlyGrossPay * NATIONAL_PENSION_RATE);
    setNationalPensionDeduction(np);

    const hi = Math.floor(calculatedMonthlyGrossPay * HEALTH_INSURANCE_RATE);
    setHealthInsuranceDeduction(hi);

    const ltc = Math.floor(hi * LONG_TERM_CARE_RATE);
    const ei = Math.floor(calculatedMonthlyGrossPay * EMPLOYMENT_INSURANCE_RATE);
    setEmploymentInsuranceDeduction(ei);

    const it = Math.floor(calculatedMonthlyGrossPay * INCOME_TAX_SIMPLIFIED_RATE);
    setIncomeTaxDeduction(it);

    const lit = Math.floor(it * LOCAL_INCOME_TAX_RATE);
    setLocalIncomeTaxDeduction(lit);

    const calculatedTotalDeductions = Math.floor(np + hi + ltc + ei + it + lit);
    setTotalDeductions(calculatedTotalDeductions);

    const calculatedMonthlyNetPay = Math.floor(calculatedMonthlyGrossPay - calculatedTotalDeductions);
    setMonthlyNetPay(calculatedMonthlyNetPay);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>월간 급여 계산</Title>
          <TextInput
            label="시급 (원)"
            style={styles.input}
            keyboardType="numeric"
            value={hourlyWage}
            onChangeText={setHourlyWage}
            mode="outlined"
          />
          <TextInput
            label="주간 근무 시간"
            style={styles.input}
            keyboardType="numeric"
            value={weeklyHours}
            onChangeText={setWeeklyHours}
            mode="outlined"
          />
          <TextInput
            label="월간 근무 일수"
            style={styles.input}
            keyboardType="numeric"
            value={monthlyWorkingDays}
            onChangeText={setMonthlyWorkingDays}
            mode="outlined"
          />
          <Button mode="contained" onPress={calculatePay} style={styles.button}>
            계산하기
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>계산 결과</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>항목</DataTable.Title>
              <DataTable.Title numeric>금액</DataTable.Title>
            </DataTable.Header>

            <DataTable.Row>
              <DataTable.Cell>월간 총 급여 (세전)</DataTable.Cell>
              <DataTable.Cell numeric>{monthlyGrossPay.toLocaleString()}원</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>  - 월간 주휴수당</DataTable.Cell>
              <DataTable.Cell numeric>{monthlyWeeklyHolidayPay.toLocaleString()}원</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>총 공제액</DataTable.Cell>
              <DataTable.Cell numeric>{totalDeductions.toLocaleString()}원</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>  - 국민연금</DataTable.Cell>
              <DataTable.Cell numeric>{nationalPensionDeduction.toLocaleString()}원</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>  - 건강보험</DataTable.Cell>
              <DataTable.Cell numeric>{healthInsuranceDeduction.toLocaleString()}원</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>  - 고용보험</DataTable.Cell>
              <DataTable.Cell numeric>{employmentInsuranceDeduction.toLocaleString()}원</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>  - 소득세</DataTable.Cell>
              <DataTable.Cell numeric>{incomeTaxDeduction.toLocaleString()}원</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>  - 지방소득세</DataTable.Cell>
              <DataTable.Cell numeric>{localIncomeTaxDeduction.toLocaleString()}원</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row style={styles.netPayRow}>
              <DataTable.Cell><Title>월간 실수령액 (세후)</Title></DataTable.Cell>
              <DataTable.Cell numeric><Title>{monthlyNetPay.toLocaleString()}원</Title></DataTable.Cell>
            </DataTable.Row>
          </DataTable>
          <Caption style={styles.disclaimer}>* 위 계산은 2024년 기준의 단순화된 시뮬레이션이며, 실제 급여 및 공제액과 다를 수 있습니다. 정확한 정보는 관련 기관에 문의하세요.</Caption>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 8,
  },
  card: {
    margin: 8,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  netPayRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: '#DDD',
  },
  disclaimer: {
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PayScreen;
