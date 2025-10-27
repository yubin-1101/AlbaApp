import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../supabase';

const QRScannerScreen = ({ navigation, route }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { type: clockType } = route.params; // 'clock-in' or 'clock-out'

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const handleBarCodeScanned = async (barcode) => {
    setScanned(true);
    console.log('Scanned raw data:', barcode.data); // Debug log
    try {
      const qrData = JSON.parse(barcode.data);
      console.log('Parsed QR data:', qrData); // Debug log
      const { branchId, token } = qrData;

      if (!branchId || !token) {
        throw new Error('Invalid QR code format.');
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: validQr, error: qrError } = await supabase
        .from('daily_qrs')
        .select('id')
        .eq('branch_id', branchId)
        .eq('qr_data', token)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`)
        .single();

      if (qrError || !validQr) {
        Alert.alert('오류', '유효하지 않거나 만료된 QR 코드입니다.', [{ text: '다시 시도', onPress: () => setScanned(false) }]);
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        navigation.goBack();
        return;
      }

      // 1. Get employee's record from 'employees' table
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('branch_code, status')
        .eq('user_id', user.id)
        .single();

      if (employeeError || !employee) {
        throw new Error('직원 정보를 찾을 수 없습니다.');
      }

      // 2. Check if employee is approved
      if (employee.status !== 'approved') {
        Alert.alert('오류', '아직 승인되지 않은 직원입니다. 고용주에게 문의하세요.', [{ text: '확인', onPress: () => setScanned(false) }]);
        return;
      }

      // 3. Get the branch_code for the branch_id from the QR code
      const { data: qrBranch, error: qrBranchError } = await supabase
        .from('branches')
        .select('branch_code')
        .eq('id', branchId) // Use branchId from QR data
        .single();

      if (qrBranchError || !qrBranch) {
        throw new Error('QR 코드에 해당하는 지점 정보를 찾을 수 없습니다.');
      }

      // 4. Compare the employee's branch_code with the QR's branch_code
      if (employee.branch_code !== qrBranch.branch_code) {
        Alert.alert('오류', '이 지점에 등록된 직원이 아닙니다.', [{ text: '확인', onPress: () => setScanned(false) }]);
        return;
      }

      // All checks passed. Proceed with clock-in/out.
      if (clockType === 'clock-in') {
        const { error } = await supabase
          .from('attendance')
          .insert([{ employee_id: user.id, branch_id: branchId }]);
        if (error) throw error;
        Alert.alert('성공', '출근 처리되었습니다.');
      } else if (clockType === 'clock-out') {
        const { data: attendanceData, error: fetchError } = await supabase
          .from('attendance')
          .select('id')
          .eq('employee_id', user.id)
          .is('clock_out_time', null)
          .order('clock_in_time', { ascending: false })
          .limit(1)
          .single();

        if (fetchError || !attendanceData) {
          throw new Error('출근 기록을 찾을 수 없습니다.');
        }

        const { error: updateError } = await supabase
          .from('attendance')
          .update({ clock_out_time: new Date() })
          .eq('id', attendanceData.id);
        if (updateError) throw updateError;
        Alert.alert('성공', '퇴근 처리되었습니다.');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', error.message || '잘못된 QR 코드입니다.', [{ text: '다시 시도', onPress: () => setScanned(false) }]);
    }
  };

  if (!permission) return <ActivityIndicator style={styles.center} size="large" />;
  if (!permission.granted)
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>카메라 권한이 필요합니다.</Text>
        <Button title="권한 허용" onPress={requestPermission} />
      </View>
    );

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={
          scanned ? undefined : (barcode) => handleBarCodeScanned(barcode)
        }
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      {scanned && <Button title="다시 스캔하기" onPress={() => setScanned(false)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QRScannerScreen;
