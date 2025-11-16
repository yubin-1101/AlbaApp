import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../supabase';
import { format, parseISO } from 'date-fns';
import WorkDetailModal from '../src/components/calendar/WorkDetailModal';

const BACKGROUND_COLOR = '#E0F2F7';
const CARD_BACKGROUND_COLOR = '#FFFFFF';
const PRIMARY_COLOR = '#6E95FE';
const FONT_COLOR = '#333333';
const INACTIVE_TAB_COLOR = '#FFFFFF';
const ACTIVE_TAB_COLOR = '#6E95FE';
const ACTIVE_TEXT_COLOR = '#FFFFFF';
const INACTIVE_TEXT_COLOR = '#6E95FE';


const SalaryManagementScreen = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [workRecords, setWorkRecords] = useState({});
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
        .select('id, branch_code')
        .eq('employer_id', user.id)
        .single();

      if (branchError || !branch) throw new Error('소속된 지점 정보를 찾을 수 없습니다.');

      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('user_id, name')
        .eq('branch_code', branch.branch_code)
        .eq('status', 'approved');

      if (employeesError) throw employeesError;
      
      if (employeesData && employeesData.length > 0) {
        setEmployees(employeesData);
        // Set the first employee as selected by default, only if no employee is currently selected
        if (!selectedEmployeeId) {
          setSelectedEmployeeId(employeesData[0].user_id);
        }
      } else {
        setEmployees([]);
        setSelectedEmployeeId(null);
      }

      if (!employeesData || employeesData.length === 0) {
        setWorkRecords({});
        setLoading(false);
        return;
      }

      const monthDate = new Date(month);
      const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString();
      const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('employee_id, clock_in_time')
        .eq('branch_id', branch.id)
        .gte('clock_in_time', startDate)
        .lte('clock_in_time', endDate);

      if (attendanceError) throw attendanceError;

      const records = {};
      employeesData.forEach((emp) => {
        records[emp.user_id] = {};
        const empAttendance = (attendanceData || []).filter(a => a.employee_id === emp.user_id);
        empAttendance.forEach(att => {
          const date = format(new Date(att.clock_in_time), 'yyyy-MM-dd');
          records[emp.user_id][date] = { marked: true, dotColor: PRIMARY_COLOR };
        });
      });

      setWorkRecords(records);

    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedEmployeeId]);

  useEffect(() => {
    fetchCalendarData(currentMonth);
  }, [fetchCalendarData, currentMonth]);

  const handleDayPress = async (day, employeeId) => {
    if (!employeeId) return;
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
        .eq('employee_id', employeeId)
        .gte('clock_in_time', dayStart)
        .lte('clock_in_time', dayEnd);

      if (attendanceError) throw attendanceError;

      if (!attendanceData || attendanceData.length === 0) {
        setSelectedDayWork([]);
        setIsModalVisible(true);
        return;
      }

      const employeeNameMap = new Map(employees.map(emp => [emp.user_id, emp.name]));

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

  const selectedEmployee = employees.find(emp => emp.user_id === selectedEmployeeId);

  if (loading && employees.length === 0) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>월별 근무 기록</Text>
      
      {employees.length > 0 ? (
        <>
          <View style={styles.employeeTabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {employees.map(emp => (
                <TouchableOpacity
                  key={emp.user_id}
                  style={[
                    styles.employeeTab,
                    selectedEmployeeId === emp.user_id && styles.activeEmployeeTab,
                  ]}
                  onPress={() => setSelectedEmployeeId(emp.user_id)}
                >
                  <Text style={[
                    styles.employeeTabText,
                    selectedEmployeeId === emp.user_id && styles.activeEmployeeTabText,
                  ]}>
                    {emp.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {loading ? <ActivityIndicator size="large" style={{marginTop: 20}}/> : (
            selectedEmployee && (
              <View style={styles.calendarContainer}>
                <Calendar
                  key={selectedEmployeeId} // Add key to force re-render on employee change
                  current={currentMonth}
                  monthFormat={'yyyy년 MM월'}
                  onMonthChange={(month) => setCurrentMonth(month.dateString)}
                  onDayPress={(day) => handleDayPress(day, selectedEmployee.user_id)}
                  markedDates={workRecords[selectedEmployee.user_id] || {}}
                  hideExtraDays={true}
                  firstDay={1}
                  enableSwipeMonths={true}
                />
              </View>
            )
          )}
        </>
      ) : (
        <Text style={styles.emptyText}>등록된 직원이 없습니다.</Text>
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
    backgroundColor: BACKGROUND_COLOR,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: FONT_COLOR,
    marginVertical: 20,
    textAlign: 'center',
  },
  employeeTabsContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  employeeTab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: INACTIVE_TAB_COLOR,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: ACTIVE_TAB_COLOR,
  },
  activeEmployeeTab: {
    backgroundColor: ACTIVE_TAB_COLOR,
  },
  employeeTabText: {
    color: INACTIVE_TEXT_COLOR,
    fontWeight: 'bold',
  },
  activeEmployeeTabText: {
    color: ACTIVE_TEXT_COLOR,
  },
  calendarContainer: {
    marginHorizontal: 15,
    marginTop: 20,
    backgroundColor: CARD_BACKGROUND_COLOR,
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
});

export default SalaryManagementScreen;