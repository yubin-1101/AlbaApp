import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { supabase } from '../supabase';
import { TextInput, Button, Title, Surface } from 'react-native-paper';

const LoginEmployerScreen = ({ navigation }) => {
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
      navigation.replace('EmployerMain');
    }
  };

  return (
    <Surface style={styles.container}>
      <Title style={styles.title}>고용주 로그인</Title>
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

export default LoginEmployerScreen;
