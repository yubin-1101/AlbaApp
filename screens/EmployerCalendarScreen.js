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
  const [debugInfo, setDebugInfo] = useState(null); // State for debug info

  const fetchCalendarData = useCallback(async (month) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .select('id, branch_code')
        .eq('employer_id', user.id)
        .single();

      if (branchError || !branch) throw new Error('소속된 지점 정보를 찾을 수 없습니다.');

      // --- DEBUGGING LOGIC ---
      const { data: lastAttendance } = await supabase.from('attendance').select('*').order('created_at', { ascending: false }).limit(1).single();
      setDebugInfo({
        employerId: user.id,
        employerBranchId: branch.id,
        employerBranchCode: branch.branch_code,
        lastAttendance: lastAttendance
      });
      // --- END DEBUGGING LOGIC ---

      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('user_id, name')
        .eq('branch_code', branch.branch_code)
        .eq('status', 'approved');

      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);

      const monthDate = new Date(month);
      const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString();
      const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('employee_id, clock_in_time')
        .eq('branch_id', branch.id);

      if (attendanceError) throw attendanceError;

      const records = {};
      const allDates = {};
      (employeesData || []).forEach((emp, index) => {
        records[emp.user_id] = {};
        const empAttendance = (attendanceData || []).filter(a => a.employee_id === emp.user_id);
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

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('employee_id, clock_in_time, clock_out_time')
        .eq('branch_id', branch.id)
        .gte('clock_in_time', dayStart)
        .lte('clock_in_time', dayEnd);

      if (attendanceError) throw attendanceError;

      if (!attendanceData || attendanceData.length === 0) {
        setSelectedDayWork([]);
        setIsModalVisible(true);
        return;
      }

      const employeeIds = attendanceData.map(att => att.employee_id);
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('user_id, name')
        .in('user_id', employeeIds);

      if (employeesError) throw employeesError;

      const employeeNameMap = new Map((employeesData || []).map(emp => [emp.user_id, emp.name]));

      const formattedData = attendanceData.map(item => {
        let duration = 'N/A';
        if (item.clock_in_time && item.clock_out_time) {
            const clockInDate = new Date(item.clock_in_time);
            const clockOutDate = new Date(item.clock_out_time);
            const diffMs = clockOutDate - clockInDate;
            const diffHrs = Math.floor(diffMs / 3600000);
            const diffMins = Math.round((diffMs % 3600000) / 60000);
            duration = `${diffHrs}시간 ${diffMins}분`;
        } else if (item.clock_in_time) {
            duration = '근무 중';
        }

        return {
          name: employeeNameMap.get(item.employee_id) || '알 수 없는 직원',
          clockIn: item.clock_in_time ? format(parseISO(item.clock_in_time), 'HH:mm') : 'N/A',
          clockOut: item.clock_out_time ? format(parseISO(item.clock_out_time), 'HH:mm') : '퇴근 전',
          duration: duration,
        };
      });

      setSelectedDayWork(formattedData);
      setIsModalVisible(true);
    } catch (error) {
      Alert.alert('오류', '근무 기록을 가져오는 데 실패했습니다: ' + error.message);
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

      {/* --- DEBUGGING VIEW --- */}
      {debugInfo && (
        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>-- 디버깅 정보 --</Text>
          <Text>고용주 ID: {debugInfo.employerId}</Text>
          <Text>고용주 지점 ID: {debugInfo.employerBranchId}</Text>
          <Text>고용주 지점 코드: {debugInfo.employerBranchCode}</Text>
          <Text>---</Text>
          <Text style={styles.debugTitle}>최근 출근 기록 (1건):</Text>
          {debugInfo.lastAttendance ? (
            <View>
              <Text>직원 ID: {debugInfo.lastAttendance.employee_id}</Text>
              <Text>지점 ID: {debugInfo.lastAttendance.branch_id}</Text>
              <Text>출근 시간: {debugInfo.lastAttendance.clock_in_time}</Text>
            </View>
          ) : (
            <Text>출근 기록 없음</Text>
          )}
        </View>
      )}
      {/* --- END DEBUGGING VIEW --- */}

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
  debugBox: {
    padding: 10,
    marginHorizontal: 20,
    backgroundColor: '#eee',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
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
