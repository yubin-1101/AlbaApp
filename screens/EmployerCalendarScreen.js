
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';

// Dummy data for employees
const DUMMY_EMPLOYEES = [
  { id: '1', name: '김민준' },
  { id: '2', name: '이서아' },
  { id: '3', name: '박도윤' },
  { id: '4', name: '최지우' },
];

// Dummy work records for each employee
const DUMMY_WORK_RECORDS = {
  '1': { // 김민준
    '2025-10-01': { marked: true, dotColor: 'blue', activeOpacity: 0 },
    '2025-10-02': { marked: true, dotColor: 'blue', activeOpacity: 0 },
    '2025-10-08': { marked: true, dotColor: 'blue', activeOpacity: 0 },
    '2025-10-09': { marked: true, dotColor: 'blue', activeOpacity: 0 },
    '2025-10-15': { marked: true, dotColor: 'blue', activeOpacity: 0 },
  },
  '2': { // 이서아
    '2025-10-05': { marked: true, dotColor: 'green', activeOpacity: 0 },
    '2025-10-06': { marked: true, dotColor: 'green', activeOpacity: 0 },
    '2025-10-12': { marked: true, dotColor: 'green', activeOpacity: 0 },
    '2025-10-13': { marked: true, dotColor: 'green', activeOpacity: 0 },
    '2025-10-19': { marked: true, dotColor: 'green', activeOpacity: 0 },
  },
  '3': { // 박도윤
    '2025-10-01': { marked: true, dotColor: 'red', activeOpacity: 0 },
    '2025-10-08': { marked: true, dotColor: 'red', activeOpacity: 0 },
    '2025-10-15': { marked: true, dotColor: 'red', activeOpacity: 0 },
    '2025-10-22': { marked: true, dotColor: 'red', activeOpacity: 0 },
    '2025-10-29': { marked: true, dotColor: 'red', activeOpacity: 0 },
  },
  '4': { // 최지우
    '2025-10-10': { marked: true, dotColor: 'purple', activeOpacity: 0 },
    '2025-10-11': { marked: true, dotColor: 'purple', activeOpacity: 0 },
    '2025-10-17': { marked: true, dotColor: 'purple', activeOpacity: 0 },
    '2025-10-18': { marked: true, dotColor: 'purple', activeOpacity: 0 },
    '2025-10-24': { marked: true, dotColor: 'purple', activeOpacity: 0 },
  },
};

const EmployerCalendarScreen = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleEmployeePress = (employee) => {
    if (selectedEmployee && selectedEmployee.id === employee.id) {
      setSelectedEmployee(null); // Deselect if the same employee is clicked again
    } else {
      setSelectedEmployee(employee);
    }
  };

  const renderEmployee = ({ item }) => (
    <TouchableOpacity 
      style={[styles.employeeButton, selectedEmployee?.id === item.id && styles.selectedEmployeeButton]}
      onPress={() => handleEmployeePress(item)}
    >
      <Text style={[styles.employeeName, selectedEmployee?.id === item.id && styles.selectedEmployeeName]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>사장님 캘린더</Text>
      <Calendar
        current={new Date()}
        monthFormat={'yyyy MM'}
        hideExtraDays={true}
        firstDay={1}
        enableSwipeMonths={true}
      />
      <View style={styles.employeeListContainer}>
        <Text style={styles.employeeListTitle}>알바생 캘린더 보기</Text>
        <FlatList
          data={DUMMY_EMPLOYEES}
          renderItem={renderEmployee}
          keyExtractor={item => item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {selectedEmployee && (
        <View style={styles.employeeCalendarWrapper}>
          <Text style={styles.employeeNameTitle}>{selectedEmployee.name} 캘린더</Text>
          <Calendar
            current={new Date()}
            monthFormat={'yyyy MM'}
            hideExtraDays={true}
            firstDay={1}
            markedDates={DUMMY_WORK_RECORDS[selectedEmployee.id]}
            hideArrows={true}
            disableMonthChange={true}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
});

export default EmployerCalendarScreen;
