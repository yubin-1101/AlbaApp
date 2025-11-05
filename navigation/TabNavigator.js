import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import PayScreen from '../screens/PayScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScheduleScreen from '../screens/ScheduleScreen'; // 스케줄 스크린 추가

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === '홈') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === '급여') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === '프로필') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === '스케줄') { // 스케줄 아이콘 추가
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#D1C4E9',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen name="급여" component={PayScreen} />
      <Tab.Screen name="스케줄" component={ScheduleScreen} />
      <Tab.Screen name="프로필" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
