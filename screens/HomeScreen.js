import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, Modal, TouchableOpacity, Button } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabase';

const BACKGROUND_COLOR = '#E0F2F7';
const CARD_BACKGROUND_COLOR = '#FFFDE7';
const PRIMARY_COLOR = '#6E95FE';
const FONT_COLOR = '#333333';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [workRecords, setWorkRecords] = useState({});
  const [markedDates, setMarkedDates] = useState({});

  const onDayPress = (day) => {
    const data = workRecords[day.dateString];
    if (data) {
      setSelectedDayData({ ...data, date: day.dateString });
      setModalVisible(true);
    } else {
      setSelectedDayData({ date: day.dateString, clock_in_time: '휴무', clock_out_time: null });
      setModalVisible(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchWorkRecords = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('attendance')
          .select('clock_in_time, clock_out_time')
          .eq('employee_id', user.id);

        if (error) {
          console.error('Error fetching attendance:', error);
          return;
        }

        const records = {};
        const dates = {};
        data.forEach(item => {
          if (!item.clock_in_time) return;
          const date = new Date(item.clock_in_time).toISOString().split('T')[0];
          records[date] = {
            clock_in_time: new Date(item.clock_in_time).toLocaleTimeString(),
            clock_out_time: item.clock_out_time ? new Date(item.clock_out_time).toLocaleTimeString() : '퇴근 전',
          };
          dates[date] = { marked: true, selectedColor: PRIMARY_COLOR };
        });

        setWorkRecords(records);
        setMarkedDates(dates);
      };

      fetchWorkRecords();
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Calendar
        onDayPress={onDayPress}
        theme={{
          selectedDayBackgroundColor: PRIMARY_COLOR,
          arrowColor: PRIMARY_COLOR,
          dotColor: PRIMARY_COLOR,
          todayTextColor: PRIMARY_COLOR,
          'stylesheet.calendar.header': {
            week: {
              marginTop: 5,
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: BACKGROUND_COLOR,
            },
          },
        }}
        markedDates={markedDates}
      />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>10월 통계</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>총 근무 시간</Text>
          <Text style={styles.statsValue}>계산 필요</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>예상 급여</Text>
          <Text style={styles.statsValue}>계산 필요</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('QRScanner', { type: 'clock-in' })}>
          <Text style={styles.buttonText}>출근</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.clockOutButton]} onPress={() => navigation.navigate('QRScanner', { type: 'clock-out' })}>
          <Text style={styles.buttonText}>퇴근</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{selectedDayData?.date} 근무 상세</Text>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>출근 시간:</Text>
              <Text style={styles.modalDetailValue}>{selectedDayData?.clock_in_time}</Text>
            </View>
            {selectedDayData?.clock_out_time &&
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>퇴근 시간:</Text>
                <Text style={styles.modalDetailValue}>{selectedDayData?.clock_out_time}</Text>
              </View>
            }
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  card: {
    backgroundColor: CARD_BACKGROUND_COLOR,
    borderRadius: 10,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: FONT_COLOR,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statsLabel: {
    fontSize: 16,
    color: 'gray',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: FONT_COLOR,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: FONT_COLOR,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  modalDetailLabel: {
    fontSize: 16,
    color: 'gray',
  },
  modalDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: FONT_COLOR,
  },
  modalCloseButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: '50%',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
  clockOutButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;