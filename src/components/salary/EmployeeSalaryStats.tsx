import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

// 목업 데이터: 알바생 3명, 각각 2일, 4일, 7일 근무, 시급 10,000원
const mockEmployees = [
  { name: '김철수', days: 2 },
  { name: '이영희', days: 4 },
  { name: '박민수', days: 7 },
];
const hourlyWage = 10000;
const hoursPerDay = 8;

const getMonthlySalary = (days: number) => days * hoursPerDay * hourlyWage;

const EmployeeSalaryStats = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const employees = mockEmployees.map(emp => ({
    ...emp,
    salary: getMonthlySalary(emp.days),
  }));
  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const avgSalary = Math.round(totalSalary / employees.length);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>2025년 11월</Text>
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>합계</Text>
          <Text style={styles.cardValue}>{totalSalary.toLocaleString()}원</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>월 평균</Text>
          <Text style={styles.cardValue}>{avgSalary.toLocaleString()}원</Text>
        </View>
      </View>
      <View style={styles.tabRow}>
        {employees.map((emp, idx) => (
          <TouchableOpacity
            key={emp.name}
            style={[styles.tab, selectedIdx === idx && styles.tabActive]}
            onPress={() => setSelectedIdx(idx)}
          >
            <Text style={[styles.tabText, selectedIdx === idx && styles.tabTextActive]}>{emp.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>최근 1년 급여</Text>
        <View style={styles.graphBarRow}>
          {/* 12개월 목업: 선택된 알바생의 이번달만 값, 나머지는 랜덤 */}
          {[...Array(12)].map((_, i) => {
            // 11월(현재)만 실제 값, 나머지는 랜덤
            const value = i === 11 ? employees[selectedIdx].salary : Math.round(Math.random() * 0.7 * employees[selectedIdx].salary);
            const max = employees[selectedIdx].salary;
            return (
              <View key={i} style={styles.barWrapper}>
                <View style={[styles.bar, i === 11 ? styles.barActive : styles.barInactive, { height: 40 + (value / max) * 80 }]} />
                <Text style={styles.barLabel}>{i + 1}월</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.graphValueBox}>
          <Text style={styles.graphValue}>{employees[selectedIdx].salary.toLocaleString()}원</Text>
          <Text style={styles.graphSub}>이번 달 급여</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F9FC',
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    color: '#222',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: '#FF6F00',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#fff',
  },
  graphCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    elevation: 2,
    marginBottom: 30,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  graphBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 18,
    height: 120,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 18,
    borderRadius: 6,
    marginBottom: 4,
  },
  barActive: {
    backgroundColor: '#FF6F00',
  },
  barInactive: {
    backgroundColor: '#E0E0E0',
  },
  barLabel: {
    fontSize: 12,
    color: '#888',
  },
  graphValueBox: {
    alignItems: 'center',
    marginTop: 8,
  },
  graphValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  graphSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
});

export default EmployeeSalaryStats;
