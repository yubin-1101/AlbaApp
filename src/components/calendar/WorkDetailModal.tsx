
import React from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

interface WorkDetail {
  name: string;
  clockIn: string;
  clockOut: string;
  duration: string;
}

interface WorkDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  workDetails: WorkDetail[];
}

const WorkDetailModal: React.FC<WorkDetailModalProps> = ({
  isVisible,
  onClose,
  workDetails,
}) => {

  const renderItem = ({ item }: { item: WorkDetail }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.employeeName}>{item.name}</Text>
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>출근 시간:</Text>
        <Text style={styles.timeValue}>{item.clockIn}</Text>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>퇴근 시간:</Text>
        <Text style={styles.timeValue}>{item.clockOut}</Text>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>총 근무시간:</Text>
        <Text style={styles.timeValue}>{item.duration}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>근무 상세 정보</Text>
          <FlatList
            data={workDetails}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            ListEmptyComponent={<Text style={styles.emptyText}>해당 날짜의 근무 기록이 없습니다.</Text>}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
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
  },
  itemContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: '100%',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 14,
    color: '#495057',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  emptyText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
    width: '100%',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WorkDetailModal;
