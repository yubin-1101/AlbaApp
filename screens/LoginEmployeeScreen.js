import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { supabase } from '../supabase';
import { TextInput, Button, Title, Surface } from 'react-native-paper';

const LoginEmployeeScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.log('Supabase signIn error:', error);
      Alert.alert('로그인 오류', error.message);
    } else if (data.user) {
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('status')
        .eq('user_id', data.user.id)
        .single();

      if (employeeError) {
        console.log('Supabase employee fetch error:', employeeError);
        Alert.alert('오류', '직원 정보를 불러오는데 실패했습니다.');
        return;
      }

      if (employee.status === 'pending') {
        Alert.alert('승인 대기', '고용주의 승인을 기다려주세요.');
        supabase.auth.signOut();
      } else if (employee.status === 'approved') {
        navigation.replace('Main');
      } else {
        Alert.alert('오류', '알 수 없는 직원 상태입니다.');
        supabase.auth.signOut();
      }
    }
  };

  return (
    <Surface style={styles.container}>
      <Title style={styles.title}>근로자 로그인</Title>
      <TextInput
        label="이메일"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="비밀번호"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button mode="contained" style={styles.button} onPress={handleLogin}>
        로그인
      </Button>
      <View style={styles.linksContainer}>
        <Button compact onPress={() => alert('비밀번호 찾기 기능은 준비중입니다.')}>
          비밀번호를 잊으셨나요?
        </Button>
        <Button compact onPress={() => navigation.navigate('Register')}>
          회원가입
        </Button>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    alignSelf: 'center',
    marginBottom: 40,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
});

export default LoginEmployeeScreen;
