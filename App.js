import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './navigation/TabNavigator';
import SplashScreen from './screens/SplashScreen';
import LoginEmployeeScreen from './screens/LoginEmployeeScreen';
import LoginEmployerScreen from './screens/LoginEmployerScreen';
import RegisterScreen from './screens/RegisterScreen';
import RegisterEmployeeScreen from './screens/RegisterEmployeeScreen';
import RegisterEmployerScreen from './screens/RegisterEmployerScreen';
import AuthSelectionScreen from './screens/AuthSelectionScreen';
import EmployerTabNavigator from './navigation/EmployerTabNavigator';
import QRScannerScreen from './screens/QRScannerScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AuthSelection">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AuthSelection" component={AuthSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LoginEmployee" component={LoginEmployeeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LoginEmployer" component={LoginEmployerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RegisterEmployee" component={RegisterEmployeeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RegisterEmployer" component={RegisterEmployerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="EmployerMain" component={EmployerTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}