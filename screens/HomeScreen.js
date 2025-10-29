import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabase';
import { Appbar, Card, Title, Paragraph, Button, Modal, Portal, Provider, DataTable } from 'react-native-paper';

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
          
          const localDate = new Date(item.clock_in_time);
          const year = localDate.getFullYear();
          const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
          const day = localDate.getDate().toString().padStart(2, '0');
          const date = `${year}-${month}-${day}`;

          const formatTime = (time) => {
            if (!time) return null;
            const d = new Date(time);
            return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          }

          records[date] = {
            clock_in_time: formatTime(item.clock_in_time),
            clock_out_time: item.clock_out_time ? formatTime(item.clock_out_time) : '퇴근 전',
          };
          dates[date] = { marked: true, selectedColor: '#6E95FE' };
        });

        setWorkRecords(records);
        setMarkedDates(dates);
      };

      fetchWorkRecords();
    }, [])
  );

  return (
    <Provider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Calendar
          onDayPress={onDayPress}
          theme={{
            selectedDayBackgroundColor: '#6E95FE',
            arrowColor: '#6E95FE',
            dotColor: '#6E95FE',
            todayTextColor: '#6E95FE',
          }}
          markedDates={markedDates}
        />
        <Card style={styles.card}>
          <Card.Content>
            <Title>10월 통계</Title>
            <DataTable>
              <DataTable.Row>
                <DataTable.Cell>총 근무 시간</DataTable.Cell>
                <DataTable.Cell numeric>계산 필요</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>예상 급여</DataTable.Cell>
                <DataTable.Cell numeric>계산 필요</DataTable.Cell>
              </DataTable.Row>
            </DataTable>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button icon="camera" mode="contained" onPress={() => navigation.navigate('QRScanner', { type: 'clock-in' })}>
            출근
          </Button>
          <Button icon="camera" mode="contained" onPress={() => navigation.navigate('QRScanner', { type: 'clock-out' })} style={{backgroundColor: '#F44336'}}>
            퇴근
          </Button>
        </View>

        <Portal>
          <Modal visible={isModalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Title>{selectedDayData?.date} 근무 상세</Title>
            <Paragraph>출근 시간: {selectedDayData?.clock_in_time}</Paragraph>
            {selectedDayData?.clock_out_time &&
              <Paragraph>퇴근 시간: {selectedDayData?.clock_out_time}</Paragraph>
            }
            <Button onPress={() => setModalVisible(false)} style={{marginTop: 20}}>닫기</Button>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    margin: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});

export default HomeScreen;