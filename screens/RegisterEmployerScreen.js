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

const RegisterEmployerScreen = ({ navigation }) => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [branchCode, setBranchCode] = useState(''); // State for branch code input

  const handleRegister = async () => {
    if (!companyName || !email || !password || !confirmPassword || !phoneNumber || !branchCode) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('비밀번호 불일치', '비밀번호가 일치하지 않습니다.');
      return;
    }

    const finalBranchCode = branchCode.trim().toUpperCase();

    const { data: { user }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('회원가입 오류', error.message);
      return;
    }

    if (user) {
      const { error: rpcError } = await supabase.rpc('create_employer_with_branch', {
        p_user_id: user.id,
        p_company_name: companyName,
        p_phone_number: phoneNumber,
        p_branch_code: finalBranchCode,
      });

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        Alert.alert(
          '등록 오류',
          '지점 정보를 등록하는 데 실패했습니다. 지점 코드가 이미 사용 중일 수 있습니다. 다른 코드를 시도해주세요.'
        );
        return;
      }

      Alert.alert('회원가입 성공', `회원가입이 완료되었습니다. 지점 코드: ${finalBranchCode}`);
      navigation.navigate('LoginEmployer');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>고용주 회원가입</Text>
      <TextInput
        style={styles.input}
        placeholder="회사명"
        placeholderTextColor="#999"
        value={companyName}
        onChangeText={setCompanyName}
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
      {/* Restored branch code input */}
      <TextInput
        style={styles.input}
        placeholder="지점 번호 (직원과 공유할 코드)"
        placeholderTextColor="#999"
        value={branchCode}
        onChangeText={setBranchCode}
        autoCapitalize="characters"
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {navigation.navigate('LoginEmployer');}}>
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
    backgroundColor: '#4A90E2',
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

export default RegisterEmployerScreen;