
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../supabase';

const EmployerQRScreen = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrCreateQR = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('사용자 정보를 가져올 수 없습니다.');

        // Use the user.id to find the correct branch directly from the 'branches' table
        const { data: branch, error: branchError } = await supabase
          .from('branches')
          .select('id')
          .eq('employer_id', user.id)
          .maybeSingle();

        if (branchError) throw branchError;
        if (!branch) throw new Error('지점 ID를 branches 테이블에서 찾을 수 없습니다. 로그인한 고용주에게 할당된 지점이 있는지 확인하세요.');

        const branchId = branch.id; // The correct foreign key

        const today = new Date().toISOString().split('T')[0];
        const { data: existingQr, error: selectError } = await supabase
          .from('daily_qrs')
          .select('qr_data')
          .eq('branch_id', branchId)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lte('created_at', `${today}T23:59:59.999Z`)
          .maybeSingle();

        if (selectError) throw selectError;

        let token;
        if (existingQr) {
          token = existingQr.qr_data;
        } else {
          const newQrToken = Math.random().toString(36).substring(2, 15);
          const { data: newQr, error: insertError } = await supabase
            .from('daily_qrs')
            .insert([{ branch_id: branchId, qr_data: newQrToken }])
            .select('qr_data')
            .single();

          if (insertError) throw insertError;
          token = newQr.qr_data;
        }
        setQrData({ branchId, token });

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateQR();
  }, []);

  if (loading) {
    return <ActivityIndicator style={styles.center} size="large" />;
  }

  if (error) {
    return <Text style={styles.errorText}>오류: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의 출퇴근 QR 코드</Text>
      <Text style={styles.subtitle}>직원에게 이 QR 코드를 보여주세요.</Text>
      {qrData && (
        <View style={styles.qrContainer}>
          <QRCode
            value={JSON.stringify(qrData)}
            size={250}
            backgroundColor='white'
            color='black'
          />
        </View>
      )}
      <Text style={styles.footer}>이 QR 코드는 매일 자정에 자동 갱신됩니다.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 40,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  footer: {
    marginTop: 40,
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EmployerQRScreen;
