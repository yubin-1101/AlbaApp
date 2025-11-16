import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { supabase } from '../supabase';

const RegisterEmployeeScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [branchCode, setBranchCode] = useState('');

  const handleRegister = async () => {
    const trimmedBranchCode = branchCode.trim().toUpperCase();
    if (!name || !email || !password || !confirmPassword || !phoneNumber || !trimmedBranchCode) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('비밀번호 불일치', '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // 1. Validate branch code
      const { data: branchData, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('branch_code', trimmedBranchCode)
        .maybeSingle();

      if (branchError) {
        throw new Error(`지점 코드 확인 중 오류가 발생했습니다: ${branchError.message}`);
      }

      if (!branchData) {
        Alert.alert('입력 오류', '존재하지 않는 지점 번호입니다. 다시 확인해주세요.');
        return;
      }

      // 2. Sign up the user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) {
        throw signUpError;
      }

      if (user) {
        // 3. Insert into employees table with pending status
        const { error: employeeInsertError } = await supabase
          .from('employees')
          .insert([{ user_id: user.id, name: name, phone_number: phoneNumber, branch_code: trimmedBranchCode, status: 'pending' }]);

        if (employeeInsertError) {
          throw employeeInsertError;
        }

        Alert.alert('회원가입 요청 완료', '고용주의 승인을 기다려주세요.');
        navigation.navigate('LoginEmployee');
      }
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>알바생 회원가입</Text>
      <TextInput
        style={styles.input}
        placeholder="이름"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="이메일"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호 확인"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="전화번호"
        placeholderTextColor="#999"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="지점 번호"
        placeholderTextColor="#999"
        value={branchCode}
        onChangeText={setBranchCode}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {navigation.navigate('LoginEmployee');}}>
        <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#50E3C2',
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#4A90E2',
    fontSize: 14,
    marginTop: 20,
  },
});

export default RegisterEmployeeScreen;