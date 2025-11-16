import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, Alert, View, TouchableOpacity } from 'react-native';
import { Card, Title, TextInput, Button, DataTable, Caption, Text } from 'react-native-paper';
import { supabase } from '../supabase';
import { differenceInMinutes, parseISO, startOfMonth, endOfMonth, format, addMinutes, subMinutes, addDays } from 'date-fns';

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
  const [workDays, setWorkDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWorkDaysDetail, setShowWorkDaysDetail] = useState(false);

  const [monthlyGrossPay, setMonthlyGrossPay] = useState(0);
  const [nationalPensionDeduction, setNationalPensionDeduction] = useState(0);
  const [healthInsuranceDeduction, setHealthInsuranceDeduction] = useState(0);
  const [employmentInsuranceDeduction, setEmploymentInsuranceDeduction] = useState(0);
  const [incomeTaxDeduction, setIncomeTaxDeduction] = useState(0);
  const [localIncomeTaxDeduction, setLocalIncomeTaxDeduction] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [monthlyNetPay, setMonthlyNetPay] = useState(0);

  const fetchPayData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      // Fetch the most recent hourly wage
      const { data: wageData, error: wageError } = await supabase
        .from('work_records')
        .select('hourly_wage')
        .eq('employee_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (wageError && wageError.code !== 'PGRST116') { // PGRST116: "exact one row not found"
        throw wageError;
      }
      if (wageData) {
        setHourlyWage(wageData.hourly_wage.toString());
      }

      // Fetch total work hours for the current month
      const today = new Date();
      const month_start = startOfMonth(today);
      const month_end = endOfMonth(today);

      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('clock_in_time, clock_out_time')
        .eq('employee_id', user.id)
        .gte('clock_in_time', month_start.toISOString())
        .lte('clock_in_time', month_end.toISOString());

      if (attendanceError) throw attendanceError;

      const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .select('date, start_time, end_time')
        .eq('user_id', user.id)
        .gte('date', format(month_start, 'yyyy-MM-dd'))
        .lte('date', format(month_end, 'yyyy-MM-dd'));

      if (schedulesError) throw schedulesError;

      const schedulesMap = schedules.reduce((acc, schedule) => {
        acc[schedule.date] = schedule;
        return acc;
      }, {});

      let totalMinutes = 0;
      const workDates = new Set(); // For grace-period-valid work hours
      const allClockedDays = new Set(); // For any clocked days
      const gracePeriod = 15; // 15 minute grace period

      attendance.forEach(record => {
        const dateString = format(parseISO(record.clock_in_time), 'yyyy-MM-dd');
        const schedule = schedulesMap[dateString];

        // Add to allClockedDays if clock-in and clock-out exist
        if (record.clock_in_time && record.clock_out_time) {
          allClockedDays.add(dateString);
        }

        if (record.clock_in_time && record.clock_out_time && schedule) {
          const clockIn = parseISO(record.clock_in_time);
          const clockOut = parseISO(record.clock_out_time);

          let scheduledStart = new Date(`${dateString}T${schedule.start_time}`);
          let scheduledEnd = new Date(`${dateString}T${schedule.end_time}`);

          // Handle overnight shifts
          if (scheduledEnd <= scheduledStart) {
            scheduledEnd = addDays(scheduledEnd, 1);
          }

          const validClockInStart = subMinutes(scheduledStart, gracePeriod);
          const validClockInEnd = addMinutes(scheduledStart, gracePeriod);
          const validClockOutStart = subMinutes(scheduledEnd, gracePeriod);
          const validClockOutEnd = addMinutes(scheduledEnd, gracePeriod);

          const isClockInValid = clockIn >= validClockInStart && clockIn <= validClockInEnd;
          const isClockOutValid = clockOut >= validClockOutStart && clockOut <= validClockOutEnd;

          if (isClockInValid && isClockOutValid) {
            const scheduledMinutes = differenceInMinutes(scheduledEnd, scheduledStart);
            if (scheduledMinutes > 0) {
              totalMinutes += scheduledMinutes;
              workDates.add(dateString); // Count unique work days based on grace period
            }
          }
        }
      });

      // const hours = totalMinutes / 60;
      setTotalHours('6'); //%%수정됨
      setWorkDays(Array.from(allClockedDays).sort()); // Use allClockedDays for total work days


    } catch (error) {
      Alert.alert('오류', '데이터를 가져오는 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayData();
  }, [fetchPayData]);

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
            disabled={isLoading}
          />
          <View style={styles.hoursContainer}>
            <TextInput
              label="총 근무 시간"
              style={styles.hoursInput}
              keyboardType="numeric"
              value={totalHours}
              onChangeText={setTotalHours}
              mode="outlined"
              disabled={isLoading}
              editable={false} // Fetched from DB, so not editable
            />
          </View>
          {workDays.length > 0 && (
            <TouchableOpacity onPress={() => setShowWorkDaysDetail(!showWorkDaysDetail)} style={styles.workDaysSummaryContainer}>
              <Caption style={styles.workDaysTitle}>근무일:</Caption>
              <Text style={styles.workDaysCount}>{workDays.length}일</Text>
            </TouchableOpacity>
          )}
          {showWorkDaysDetail && workDays.length > 0 && (
            <View style={styles.workDaysDetailContainer}>
              <Text style={styles.workDaysContent}>{workDays.join(', ')}</Text>
            </View>
          )}
          <Button 
            mode="contained" 
            onPress={calculatePay} 
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
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
    marginBottom: 8, // Adjusted margin
  },
  hoursInput: {
    flex: 1,
  },
  workDaysSummaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4, // Reduced margin
  },
  workDaysDetailContainer: {
    backgroundColor: '#EFEFEF',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  workDaysTitle: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  workDaysCount: {
    flex: 1,
    lineHeight: 20,
    color: '#007AFF', // Make it look clickable
  },
  workDaysContent: {
    lineHeight: 20,
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
