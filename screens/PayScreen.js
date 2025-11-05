import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, View } from 'react-native';
import { Card, Title, TextInput, Button, DataTable, Caption } from 'react-native-paper';
import { supabase } from '../supabase';
import { differenceInMinutes, parseISO, startOfMonth, endOfMonth, format } from 'date-fns';

// Constants for calculation
const NATIONAL_PENSION_RATE = 0.045;
const HEALTH_INSURANCE_RATE = 0.03545;
const LONG_TERM_CARE_RATE = 0.1295;
const EMPLOYMENT_INSURANCE_RATE = 0.009;
const INCOME_TAX_SIMPLIFIED_RATE = 0.03;
const LOCAL_INCOME_TAX_RATE = 0.1;

const PayScreen = () => {
  const [hourlyWage, setHourlyWage] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [monthlyGrossPay, setMonthlyGrossPay] = useState(0);
  const [nationalPensionDeduction, setNationalPensionDeduction] = useState(0);
  const [healthInsuranceDeduction, setHealthInsuranceDeduction] = useState(0);
  const [employmentInsuranceDeduction, setEmploymentInsuranceDeduction] = useState(0);
  const [incomeTaxDeduction, setIncomeTaxDeduction] = useState(0);
  const [localIncomeTaxDeduction, setLocalIncomeTaxDeduction] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [monthlyNetPay, setMonthlyNetPay] = useState(0);

  const fetchTotalWorkHours = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      const today = new Date();
      const month_start = startOfMonth(today);
      const month_end = endOfMonth(today);

      // 1. Fetch attendance records for the current month
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('clock_in_time, clock_out_time')
        .eq('employee_id', user.id)
        .gte('clock_in_time', month_start.toISOString())
        .lte('clock_in_time', month_end.toISOString());

      if (attendanceError) throw attendanceError;

      // 2. Fetch all schedules for the current month
      const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .select('date, start_time, end_time')
        .eq('user_id', user.id)
        .gte('date', format(month_start, 'yyyy-MM-dd'))
        .lte('date', format(month_end, 'yyyy-MM-dd'));

      if (schedulesError) throw schedulesError;

      // 3. Create a map of schedules for easy lookup
      const schedulesMap = schedules.reduce((acc, schedule) => {
        acc[schedule.date] = schedule;
        return acc;
      }, {});

      let totalMinutes = 0;
      // 4. Iterate through attendance and calculate valid work time
      attendance.forEach(record => {
        const dateString = format(parseISO(record.clock_in_time), 'yyyy-MM-dd');
        const schedule = schedulesMap[dateString];

        if (record.clock_in_time && record.clock_out_time && schedule) {
          const clockIn = parseISO(record.clock_in_time);
          const clockOut = parseISO(record.clock_out_time);

          const scheduledStart = new Date(`${dateString}T${schedule.start_time}`);
          const scheduledEnd = new Date(`${dateString}T${schedule.end_time}`);

          const effectiveStart = clockIn > scheduledStart ? clockIn : scheduledStart;
          const effectiveEnd = clockOut < scheduledEnd ? clockOut : scheduledEnd;

          const minutes = differenceInMinutes(effectiveEnd, effectiveStart);
          if (minutes > 0) {
            totalMinutes += minutes;
          }
        }
      });

      const hours = totalMinutes / 60;
      setTotalHours(hours.toFixed(2)); // 소수점 2자리까지 표시
      Alert.alert('성공', `이번 달 총 근무 시간을 가져왔습니다: ${hours.toFixed(2)}시간`);

    } catch (error) {
      Alert.alert('오류', '근무 시간을 가져오는 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePay = () => {
    const wage = parseFloat(hourlyWage);
    const tHours = parseFloat(totalHours);

    if (isNaN(wage) || isNaN(tHours) || wage <= 0 || tHours <= 0) {
      Alert.alert('입력 오류', '시급과 총 근무 시간을 올바르게 입력하거나 불러와 주세요.');
      return;
    }

    const calculatedMonthlyGrossPay = Math.floor(wage * tHours);
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
          <View style={styles.hoursContainer}>
            <TextInput
              label="총 근무 시간"
              style={styles.hoursInput}
              keyboardType="numeric"
              value={totalHours}
              onChangeText={setTotalHours}
              mode="outlined"
            />
            <Button 
              mode="outlined" 
              onPress={fetchTotalWorkHours} 
              style={styles.fetchButton}
              loading={isLoading}
              disabled={isLoading}
            >
              내 시간 가져오기
            </Button>
          </View>
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
          <Caption style={styles.disclaimer}>* 주휴수당은 포함되지 않은 예상 금액입니다. 실제 급여 및 공제액과 다를 수 있습니다.</Caption>
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
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hoursInput: {
    flex: 1,
    marginRight: 8,
  },
  fetchButton: {
    height: 55, // Match outlined TextInput height
    justifyContent: 'center',
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
