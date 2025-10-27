
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../supabase';
import { format, parseISO } from 'date-fns';
import WorkDetailModal from '../src/components/calendar/WorkDetailModal';

const COLORS = ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B', '#BD10E0', '#9013FE'];

const EmployerCalendarScreen = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [workRecords, setWorkRecords] = useState({});
  const [allWorkDates, setAllWorkDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDayWork, setSelectedDayWork] = useState([]);

  const fetchCalendarData = useCallback(async (month) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('employer_id', user.id)
        .single();

      if (branchError || !branch) throw new Error('소속된 지점 정보를 찾을 수 없습니다.');

      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('user_id, name')
        .eq('branch_code', branch.branch_code)
        .eq('status', 'approved');

      if (employeesError) throw employeesError;
      // The FlatList will now use 'name' and 'user_id' from the employees table
      setEmployees(employeesData);

      const monthDate = new Date(month);
      const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString();
      const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('employee_id, clock_in_time')
        .eq('branch_id', branch.id) // Assuming attendance uses the integer branch ID
        .gte('clock_in_time', startDate)
        .lte('clock_in_time', endDate);

      if (attendanceError) throw attendanceError;

      const records = {};
      const allDates = {};
      employeesData.forEach((emp, index) => {
        records[emp.user_id] = {};
        const empAttendance = attendanceData.filter(a => a.employee_id === emp.user_id);
        empAttendance.forEach(att => {
          const date = format(new Date(att.clock_in_time), 'yyyy-MM-dd');
          records[emp.user_id][date] = { marked: true, dotColor: COLORS[index % COLORS.length] };
          allDates[date] = { marked: true, dotColor: '#8a2be2' };
        });
      });

      setWorkRecords(records);
      setAllWorkDates(allDates);

    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData(currentMonth);
  }, [fetchCalendarData, currentMonth]);

  const handleDayPress = async (day) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: branch } = await supabase.from('branches').select('id').eq('employer_id', user.id).single();
      if (!branch) return;

      const dayStart = new Date(day.dateString + 'T00:00:00.000Z').toISOString();
      const dayEnd = new Date(day.dateString + 'T23:59:59.999Z').toISOString();

      const { data, error } = await supabase
        .from('attendance')
        .select(`
          clock_in_time,
          clock_out_time,
          employees (name)
        `)
        .eq('branch_id', branch.id)
        .gte('clock_in_time', dayStart)
        .lte('clock_in_time', dayEnd);

      if (error) throw error;

      const formattedData = data.map(item => ({
        name: item.employees.name,
        clockIn: item.clock_in_time ? format(parseISO(item.clock_in_time), 'HH:mm') : 'N/A',
        clockOut: item.clock_out_time ? format(parseISO(item.clock_out_time), 'HH:mm') : '근무 중',
      }));

      setSelectedDayWork(formattedData);
      setIsModalVisible(true);
    } catch (error) {
      Alert.alert('오류', '근무 기록을 가져오는 데 실패했습니다.');
    }
  };

  const handleEmployeePress = (employee) => {
    setSelectedEmployee(prev => prev?.user_id === employee.user_id ? null : employee);
  };

  const renderEmployee = ({ item }) => (
    <TouchableOpacity
      style={[styles.employeeButton, selectedEmployee?.user_id === item.user_id && styles.selectedEmployeeButton]}
      onPress={() => handleEmployeePress(item)}
    >
      <Text style={[styles.employeeName, selectedEmployee?.user_id === item.user_id && styles.selectedEmployeeName]}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>월별 근무 기록</Text>
      <Calendar
        current={currentMonth}
        monthFormat={'yyyy년 MM월'}
        onMonthChange={(month) => setCurrentMonth(month.dateString)}
        onDayPress={handleDayPress}
        markedDates={allWorkDates}
        hideExtraDays={true}
        firstDay={1}
        enableSwipeMonths={true}
      />
      <View style={styles.employeeListContainer}>
        <Text style={styles.employeeListTitle}>알바생 선택 (달력 보기)</Text>
        <FlatList
          data={employees}
          renderItem={renderEmployee}
          keyExtractor={item => item.user_id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>승인된 직원이 없습니다.</Text>}
        />
      </View>

      {selectedEmployee && (
        <View style={styles.employeeCalendarWrapper}>
          <Text style={styles.employeeNameTitle}>{selectedEmployee.name} 님의 근무일</Text>
          <Calendar
            current={currentMonth}
            monthFormat={'yyyy년 MM월'}
            hideExtraDays={true}
            firstDay={1}
            markedDates={workRecords[selectedEmployee.user_id]}
            hideArrows={true}
            disableMonthChange={true}
          />
        </View>
      )}
      <WorkDetailModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        workDetails={selectedDayWork}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  employeeListContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
    height: 100,
  },
  employeeListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  employeeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginHorizontal: 5,
    height: 40,
  },
  selectedEmployeeButton: {
    backgroundColor: '#4A90E2',
  },
  employeeName: {
    fontSize: 16,
    color: '#333',
  },
  selectedEmployeeName: {
    color: '#fff',
    fontWeight: 'bold',
  },
  employeeCalendarWrapper: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  employeeNameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#4A90E2',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    color: 'gray',
  },
});

export default EmployerCalendarScreen;
