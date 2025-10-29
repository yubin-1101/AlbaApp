import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../supabase';
import { format, parseISO } from 'date-fns';
import WorkDetailModal from '../src/components/calendar/WorkDetailModal';

const COLORS = ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B', '#BD10E0', '#9013FE'];
const BACKGROUND_COLOR = '#E0F2F7';
const CARD_BACKGROUND_COLOR = '#FFFDE7';
const PRIMARY_COLOR = '#6E95FE';
const FONT_COLOR = '#333333';

const SalaryManagementScreen = () => {

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
          allDates[date] = { marked: true, dotColor: PRIMARY_COLOR };
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





  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
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
    marginVertical: 20,
    textAlign: 'center',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    color: 'gray',
  },
});

export default SalaryManagementScreen;