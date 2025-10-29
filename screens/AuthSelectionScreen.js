import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Title, Subheading, Surface } from 'react-native-paper';

const AuthSelectionScreen = ({ navigation }) => {
  return (
    <Surface style={styles.container}>
      <Title style={styles.title}>환영합니다!</Title>
      <Subheading style={styles.subtitle}>어떤 유형으로 로그인/회원가입 하시겠어요?</Subheading>
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.navigate('LoginEmployee')}
      >
        알바생
      </Button>
      <Button
        mode="contained"
        style={[styles.button, styles.employerButton]}
        onPress={() => navigation.navigate('LoginEmployer')}
      >
        고용주
      </Button>
      <Button
        style={styles.registerLink}
        onPress={() => navigation.navigate('Register')}
      >
        회원가입
      </Button>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    marginBottom: 15,
    width: '80%',
  },
  employerButton: {
    backgroundColor: '#4A90E2',
  },
  registerLink: {
    marginTop: 30,
  },
});

export default AuthSelectionScreen;