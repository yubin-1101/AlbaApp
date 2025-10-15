
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Dummy data for employees
const DUMMY_EMPLOYEES = [
  { id: '1', name: '김민준', status: '근무 중', workHours: '09:00 - 18:00' },
  { id: '2', name: '이서아', status: '퇴근', workHours: '10:00 - 17:00' },
  { id: '3', name: '박도윤', status: '근무 중', workHours: '13:00 - 21:00' },
  { id: '4', name: '최지우', status: '휴무', workHours: '-' },
];

const PRIMARY_COLOR = '#4A90E2'; // A more business-like blue
const BACKGROUND_COLOR = '#F0F4F8';
const CARD_BACKGROUND_COLOR = '#FFFFFF';
const FONT_COLOR = '#333';
const ACCENT_COLOR_GREEN = '#34C759';
const ACCENT_COLOR_GRAY = '#8E8E93';


const EmployerDashboardScreen = () => {

  const renderEmployee = ({ item }) => (
    <View style={styles.employeeRow}>
      <Text style={styles.employeeName}>{item.name}</Text>
      <Text style={styles.employeeWorkHours}>{item.workHours}</Text>
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: item.status === '근무 중' ? ACCENT_COLOR_GREEN : ACCENT_COLOR_GRAY }]} />
        <Text style={[styles.employeeStatus, { color: item.status === '근무 중' ? ACCENT_COLOR_GREEN : ACCENT_COLOR_GRAY }]}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>사장님-대시보드</Text>
        <TouchableOpacity style={styles.inviteButton}>
          <Ionicons name="person-add-outline" size={20} color="#fff" />
          <Text style={styles.inviteButtonText}>직원 초대</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, styles.qrCard]}>
        <Text style={styles.cardTitle}>출퇴근 QR 코드</Text>
        <View style={styles.qrCodePlaceholder}>
            <Ionicons name="qr-code-outline" size={80} color={FONT_COLOR} />
            <Text style={styles.qrHelpText}>직원들이 이 코드를 스캔하여 출퇴근을 기록합니다.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>직원 현황</Text>
        <FlatList
          data={DUMMY_EMPLOYEES}
          renderItem={renderEmployee}
          keyExtractor={item => item.id}
          scrollEnabled={false} // To prevent nested scrolling
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  inviteButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  card: {
    backgroundColor: CARD_BACKGROUND_COLOR,
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  qrCard: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: FONT_COLOR,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  qrCodePlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  qrHelpText: {
      fontSize: 12,
      color: 'gray',
      textAlign: 'center',
      marginTop: 5,
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '500',
    color: FONT_COLOR,
    flex: 2,
  },
  employeeWorkHours: {
    fontSize: 14,
    color: 'gray',
    flex: 3,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
    justifyContent: 'flex-end',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  employeeStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EmployerDashboardScreen;
