import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Card, Title, DataTable } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabase';
import { format } from 'date-fns';

const EmployerHomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({ total: 0, working: 0 });
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      // 1. Get employer's branch code
      const { data: branchData, error: branchError } = await supabase
        .from('branches')
        .select('id, branch_code')
        .eq('owner_id', user.id)
        .single();

      if (branchError || !branchData) throw new Error('지점 정보를 가져올 수 없습니다.');
      const { id: branchId, branch_code } = branchData;

      // 2. Fetch all employees of the branch
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('user_id, name')
        .eq('branch_code', branch_code);

      if (employeesError) throw employeesError;

      const employeeIds = employeesData.map(e => e.user_id);

      // 3. Fetch today's attendance to check status
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('employee_id, clock_in_time, clock_out_time')
        .in('employee_id', employeeIds)
        .gte('clock_in_time', `${today}T00:00:00.000Z`)
        .lte('clock_in_time', `${today}T23:59:59.999Z`);

      if (attendanceError) throw attendanceError;

      const workingEmployeeIds = new Set(
        attendanceData
          .filter(att => att.clock_in_time && !att.clock_out_time)
          .map(att => att.employee_id)
      );

      const processedEmployees = employeesData.map(emp => ({
        name: emp.name,
        isWorking: workingEmployeeIds.has(emp.user_id),
      }));
      setEmployees(processedEmployees);

      // 4. Fetch today's schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('schedules')
        .select('start_time, end_time, user_id')
        .in('user_id', employeeIds)
        .eq('date', today);

      if (schedulesError) throw schedulesError;

      const employeeMap = employeesData.reduce((acc, emp) => {
        acc[emp.user_id] = emp.name;
        return acc;
      }, {});

      const processedShifts = schedulesData.map(sch => ({
        time: `${sch.start_time.substring(0, 5)} - ${sch.end_time.substring(0, 5)}`,
        name: employeeMap[sch.user_id] || '알 수 없는 직원',
        employees: employeeMap[sch.user_id] || '',
      }));
      setShifts(processedShifts);

      // 5. Set Summary Data
      setSummaryData({ total: employeesData.length, working: workingEmployeeIds.size });

    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchDashboardData);

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Title style={styles.title}>매장 대시보드</Title>

      {/* Summary Boxes */}
      <View style={styles.summaryBoxContainer}>
        <Card style={styles.summaryBox}>
          <Card.Content style={styles.summaryContent}>
            <Ionicons name="people-outline" size={24} color="#4A90E2" />
            <Text style={styles.summaryBoxLabel}>총 직원</Text>
            <Text style={styles.summaryBoxValue}>{summaryData.total}명</Text>
          </Card.Content>
        </Card>
        <Card style={styles.summaryBox}>
          <Card.Content style={styles.summaryContent}>
            <Ionicons name="walk-outline" size={24} color="#2ECC71" />
            <Text style={styles.summaryBoxLabel}>현재 근무 중</Text>
            <Text style={styles.summaryBoxValue}>{summaryData.working}명</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Today's Shifts Card */}
      <Card style={styles.card}>
        <Card.Title title="오늘의 근무 시프트" titleStyle={styles.cardTitle} />
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>시간</DataTable.Title>
            <DataTable.Title>담당자</DataTable.Title>
          </DataTable.Header>
          {shifts.map((shift, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell>{shift.time}</DataTable.Cell>
              <DataTable.Cell>{shift.name}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </Card>

      {/* All Employees Card */}
      <Card style={styles.card}>
        <Card.Title title="전체 직원 현황" titleStyle={styles.cardTitle} />
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>이름</DataTable.Title>
            <DataTable.Title numeric>상태</DataTable.Title>
          </DataTable.Header>
          {employees.map((employee, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell>{employee.name}</DataTable.Cell>
              <DataTable.Cell numeric>
                <View style={styles.statusCell}>
                  <View style={[styles.statusIndicator, { backgroundColor: employee.isWorking ? '#2ECC71' : '#E74C3C' }]} />
                  <Text>{employee.isWorking ? '근무 중' : '퇴근'}</Text>
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    marginBottom: 10,
  },
  summaryBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 10,
  },
  summaryBox: {
    flex: 1,
    marginHorizontal: 10,
    elevation: 2,
  },
  summaryContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryBoxLabel: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
  },
  summaryBoxValue: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    margin: 20,
    marginTop: 15,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  statusCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
});

export default EmployerHomeScreen;
