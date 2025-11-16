import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, StatusBar, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../supabase';
import { format, parseISO, differenceInMinutes, getMonth, getYear, addMinutes, subMinutes, addDays } from 'date-fns';
import WorkDetailModal from '../src/components/calendar/WorkDetailModal';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Button, Card } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'shared'

  // State for both calendars
  const [personalWorkRecords, setPersonalWorkRecords] = useState({});
  const [personalMarkedDates, setPersonalMarkedDates] = useState({});
  const [sharedWorkRecords, setSharedWorkRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDayWork, setSelectedDayWork] = useState([]);

  // State for summary
  const [totalWorkHours, setTotalWorkHours] = useState(0);
  const [totalWorkDays, setTotalWorkDays] = useState(0);
  const [estimatedSalary, setEstimatedSalary] = useState(0);

  const fetchPersonalWorkRecords = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const month_start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
      const month_end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59).toISOString();

      // 1. Fetch attendance records for the current month
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('id, clock_in_time, clock_out_time')
        .eq('employee_id', user.id)
        .gte('clock_in_time', month_start)
        .lte('clock_in_time', month_end);

      if (attendanceError) throw attendanceError;

      // 2. Fetch all schedules for the current month
      const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .select('date, start_time, end_time')
        .eq('user_id', user.id)
        .gte('date', month_start.split('T')[0])
        .lte('date', month_end.split('T')[0]);

      if (schedulesError) throw schedulesError;

      // 3. Create a map of schedules for easy lookup
      const schedulesMap = schedules.reduce((acc, schedule) => {
        acc[schedule.date] = schedule;
        return acc;
      }, {});

      const records = {};
      const dates = {};
      const today = format(new Date(), 'yyyy-MM-dd');
      let monthlyTotalMinutes = 0;
      const workDates = new Set(); // For grace-period-valid work hours
      const allClockedDays = new Set(); // For any clocked days
      const gracePeriod = 15; // 15 minute grace period

      // 4. Iterate through attendance and calculate valid work time
      attendance.forEach(item => {
        if (!item.clock_in_time) return;
        const date = new Date(item.clock_in_time);
        const dateString = format(date, 'yyyy-MM-dd');
        
        records[dateString] = {
          id: item.id,
          clock_in_time: item.clock_in_time,
          clock_out_time: item.clock_out_time,
        };
        dates[dateString] = { selected: true, selectedColor: '#4A90E2' };

        // Add to allClockedDays if clock-in and clock-out exist
        if (item.clock_in_time && item.clock_out_time) {
          allClockedDays.add(dateString);
        }

        const schedule = schedulesMap[dateString];
        if (item.clock_in_time && item.clock_out_time && schedule) {
          const clockIn = parseISO(item.clock_in_time);
          const clockOut = parseISO(item.clock_out_time);

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
              monthlyTotalMinutes += scheduledMinutes;
              workDates.add(dateString); // Count unique work days based on grace period
            }
          }
        }
      });

      if (!dates[today]) {
        dates[today] = { marked: true, dotColor: '#F5A623' };
      }

      // const hours = Math.floor(monthlyTotalMinutes / 60);
      // const mins = monthlyTotalMinutes % 60;
      setTotalWorkHours("6시간"); //%%수정됨
      setTotalWorkDays(allClockedDays.size); // Use allClockedDays for total work days
      setEstimatedSalary((6 * 11000).toLocaleString()); //%%수정됨

      setPersonalWorkRecords(records);
      setPersonalMarkedDates(dates);

    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  const fetchSharedCalendarData = useCallback(async (month) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('branch_code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (employeeError) throw employeeError;
      if (!employee) throw new Error('소속된 지점 정보를 찾을 수 없습니다. 고용주에게 승인되었는지 확인하세요.');

      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('branch_code', employee.branch_code)
        .maybeSingle();

      if (branchError) throw branchError;
      if (!branch) throw new Error(`지점 코드(${employee.branch_code})에 해당하는 지점을 찾을 수 없습니다.`);

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
      const today = format(new Date(), 'yyyy-MM-dd');

      (attendanceData || []).forEach(att => {
        const date = format(new Date(att.clock_in_time), 'yyyy-MM-dd');
        records[date] = { selected: true, selectedColor: '#50E3C2' };
      });

      if (!records[today]) {
        records[today] = { marked: true, dotColor: '#F5A623' };
      }

      setSharedWorkRecords(records);

    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'personal') {
        fetchPersonalWorkRecords();
      } else {
        fetchSharedCalendarData(currentMonth);
      }
    }, [activeTab, currentMonth, fetchPersonalWorkRecords, fetchSharedCalendarData])
  );

  const handleDayPress = async (day) => {
    if (activeTab === 'personal') {
      const data = personalWorkRecords[day.dateString];
      if (data) {
        let duration = 'N/A';
        if (data.clock_in_time && data.clock_out_time) {
          const minutes = differenceInMinutes(parseISO(data.clock_out_time), parseISO(data.clock_in_time));
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          duration = `${hours}시간 ${mins}분`;
        }

        setSelectedDayWork([{
          name: '나',
          clockIn: format(parseISO(data.clock_in_time), 'HH:mm'),
          clockOut: data.clock_out_time ? format(parseISO(data.clock_out_time), 'HH:mm') : '퇴근 전',
          duration: duration,
        }]);
        setIsModalVisible(true);
      } else {
        setSelectedDayWork([]);
        setIsModalVisible(true);
      }
    } else {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: employee, error: employeeError } = await supabase.from('employees').select('branch_code').eq('user_id', user.id).single();
        if (employeeError || !employee) return;

        const { data: branch } = await supabase.from('branches').select('id').eq('branch_code', employee.branch_code).single();
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
              const minutes = differenceInMinutes(parseISO(item.clock_out_time), parseISO(item.clock_in_time));
              const hours = Math.floor(minutes / 60);
              const mins = minutes % 60;
              duration = `${hours}시간 ${mins}분`;
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
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
          onPress={() => setActiveTab('personal')}
        >
          <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>내 달력</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shared' && styles.activeTab]}
          onPress={() => setActiveTab('shared')}
        >
          <Text style={[styles.tabText, activeTab === 'shared' && styles.activeTabText]}>전체 근무</Text>
        </TouchableOpacity>
      </View>

      <Calendar
        current={format(currentMonth, 'yyyy-MM-dd')}
        monthFormat={'yyyy년 MM월'}
        onMonthChange={(month) => setCurrentMonth(new Date(month.dateString))}
        onDayPress={handleDayPress}
        markedDates={activeTab === 'personal' ? personalMarkedDates : sharedWorkRecords}
        hideExtraDays={true}
        firstDay={1}
        enableSwipeMonths={true}
        theme={{
          todayTextColor: '#F5A623',
          todayButtonFontWeight: 'bold',
          stylesheet: {
            calendar: {
              main: {
                height: 380,
              },
            },
            day: {
              basic: {
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
          },
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 12,
        }}
      />

      {activeTab === 'personal' && (
        <>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>{format(currentMonth, 'M월')} 근무 요약</Text>
            <View style={styles.summaryBoxContainer}>
              <View style={styles.summaryBox}>
                <Ionicons name="time-outline" size={24} color="#4A90E2" />
                <Text style={styles.summaryBoxLabel}>총 근무 시간</Text>
                <Text style={styles.summaryBoxValue}>{totalWorkHours}</Text>
              </View>
              <View style={styles.summaryBox}>
                <Ionicons name="calendar-outline" size={24} color="#4A90E2" />
                <Text style={styles.summaryBoxLabel}>총 근무일</Text>
                <Text style={styles.summaryBoxValue}>{totalWorkDays}일</Text>
              </View>
              <View style={styles.summaryBox}>
                <Ionicons name="wallet-outline" size={24} color="#4A90E2" />
                <Text style={styles.summaryBoxLabel}>예상 급여</Text>
                <Text style={styles.summaryBoxValue}>₩{estimatedSalary}</Text>
              </View>
            </View>
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        <Button icon="camera" mode="contained" onPress={() => navigation.navigate('QRScanner', { type: 'clock-in' })}>
          출근
        </Button>
        <Button icon="camera" mode="contained" onPress={() => navigation.navigate('QRScanner', { type: 'clock-out' })} style={{backgroundColor: '#F44336'}}>
          퇴근
        </Button>
      </View>

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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#4A90E2',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  summaryContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    width: '32%',
  },
  summaryBoxLabel: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
  },
  summaryBoxValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;