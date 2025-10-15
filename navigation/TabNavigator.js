import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import PayScreen from '../screens/PayScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import CreatePostScreen from '../screens/CreatePostScreen';


const Tab = createBottomTabNavigator();
const CommunityStack = createStackNavigator();

function CommunityStackScreen() {
  return (
    <CommunityStack.Navigator>
      <CommunityStack.Screen name="Community" component={CommunityScreen} options={{ headerShown: false }} />
      <CommunityStack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: '게시글 상세' }} />
      <CommunityStack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: '게시글 작성' }} />
    </CommunityStack.Navigator>
  );
}

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
          } else if (route.name === '커뮤니티') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === '프로필') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#D1C4E9',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen name="급여" component={PayScreen} />
      <Tab.Screen name="커뮤니티" component={CommunityStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="프로필" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
