import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Platform, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Button, Provider, Card, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../supabase';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

// Modal Form for Adding/Editing Schedules
const AddScheduleForm = ({ visible, onClose, onSave }) => {
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const onChangeStartTime = (event, selectedTime) => {
        const currentTime = selectedTime || startTime;
        setShowStartTimePicker(Platform.OS === 'ios');
        setStartTime(currentTime);
    };

    const onChangeEndTime = (event, selectedTime) => {
        const currentTime = selectedTime || endTime;
        setShowEndTimePicker(Platform.OS === 'ios');
        setEndTime(currentTime);
    };

    const handleSave = () => {
        onSave({ date, startTime, endTime });
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>스케줄 추가</Text>
                    
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                        <Text style={styles.dateDisplay}>{format(date, 'yyyy년 MM월 dd일')}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
                    )}

                    <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.input}>
                        <Text style={styles.timeDisplay}>시작: {format(startTime, 'HH:mm')}</Text>
                    </TouchableOpacity>
                    {showStartTimePicker && (
                        <DateTimePicker value={startTime} mode="time" display="default" onChange={onChangeStartTime} />
                    )}

                    <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.input}>
                        <Text style={styles.timeDisplay}>종료: {format(endTime, 'HH:mm')}</Text>
                    </TouchableOpacity>
                    {showEndTimePicker && (
                        <DateTimePicker value={endTime} mode="time" display="default" onChange={onChangeEndTime} />
                    )}

                    <View style={styles.modalButtonContainer}>
                        <Button onPress={onClose} style={styles.modalButton}>취소</Button>
                        <Button onPress={handleSave} mode="contained" style={styles.modalButton}>저장</Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const ScheduleScreen = () => {
    const [schedules, setSchedules] = useState([]);
    const [branchName, setBranchName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchSchedules = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch branch name first
        const { data: employeeData, error: employeeError } = await supabase
            .from('employees')
            .select('branch_code')
            .eq('user_id', user.id)
            .single();

        if (employeeData && !employeeError) {
            const { data: branchData, error: branchError } = await supabase
                .from('branches')
                .select('name') // Changed from 'branch_name' to 'name'
                .eq('branch_code', employeeData.branch_code)
                .single();
            
            if (branchData && !branchError) {
                setBranchName(branchData.name); // Changed from 'branch_name' to 'name'
            }
        }

        // Then fetch schedules
        const { data, error } = await supabase
            .from('schedules')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (error) {
            Alert.alert('오류', '스케줄을 불러오는 중 오류가 발생했습니다.');
        } else {
            setSchedules(data);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchSchedules();
        }, [fetchSchedules])
    );

    const handleSaveSchedule = async (newSchedule) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const formattedDate = format(newSchedule.date, 'yyyy-MM-dd');
        const formattedStartTime = format(newSchedule.startTime, 'HH:mm');
        const formattedEndTime = format(newSchedule.endTime, 'HH:mm');

        const { error } = await supabase
            .from('schedules')
            .upsert({ 
                user_id: user.id, 
                date: formattedDate, 
                start_time: formattedStartTime, 
                end_time: formattedEndTime 
            }, { onConflict: 'user_id, date' });

        if (error) {
            Alert.alert('저장 실패', error.message);
        } else {
            Alert.alert('저장 완료', '스케줄이 성공적으로 저장되었습니다.');
            setIsModalVisible(false);
            fetchSchedules(); // Refresh list
        }
    };

    const handleDeleteSchedule = (scheduleId) => {
        Alert.alert(
            '스케줄 삭제',
            '정말로 이 스케줄을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                { 
                    text: '삭제', 
                    style: 'destructive', 
                    onPress: async () => {
                        const { error } = await supabase.from('schedules').delete().eq('id', scheduleId);
                        if (error) {
                            Alert.alert('삭제 실패', error.message);
                        } else {
                            fetchSchedules(); // Refresh list
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <View>
                    <Text style={styles.cardDate}>{format(new Date(item.date), 'yyyy년 MM월 dd일')}</Text>
                    <Text style={styles.cardBranch}>{branchName}</Text>
                    <Text style={styles.cardTime}>{item.start_time.substring(0,5)} - {item.end_time.substring(0,5)}</Text>
                </View>
                <IconButton
                    icon="trash-can-outline"
                    color="#FF6347"
                    size={24}
                    onPress={() => handleDeleteSchedule(item.id)}
                />
            </Card.Content>
        </Card>
    );

    return (
        <Provider>
            <View style={styles.container}>
                <Button 
                    icon="plus-circle"
                    mode="contained" 
                    onPress={() => setIsModalVisible(true)} 
                    style={styles.addButton}
                >
                    스케줄 추가
                </Button>

                <FlatList
                    data={schedules}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />

                <AddScheduleForm 
                    visible={isModalVisible} 
                    onClose={() => setIsModalVisible(false)} 
                    onSave={handleSaveSchedule} 
                />
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    addButton: {
        margin: 10,
    },
    card: {
        marginHorizontal: 10,
        marginVertical: 5,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardDate: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardBranch: {
        fontSize: 14,
        color: '#333',
        marginTop: 4,
    },
    cardTime: {
        fontSize: 14,
        color: 'gray',
        marginTop: 4,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateDisplay: { fontSize: 18 },
    timeDisplay: { fontSize: 18 },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    modalButton: {
        width: '45%',
    }
});

export default ScheduleScreen;