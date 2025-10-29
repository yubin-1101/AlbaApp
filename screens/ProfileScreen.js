import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Title, Subheading, List, Divider, Button } from 'react-native-paper';
import { supabase } from '../supabase';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      navigation.replace('AuthSelection');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Avatar.Text size={80} label={user?.email?.charAt(0).toUpperCase() || 'A'} style={styles.avatar} />
        <Title style={styles.profileName}>{user?.email}</Title>
      </View>
      <List.Section style={styles.menuContainer}>
        <List.Item
          title="개인정보 수정"
          left={() => <List.Icon icon="account-edit" />}
          onPress={() => { /* Navigate to edit profile screen */ }}
        />
        <Divider />
        <List.Item
          title="알림 설정"
          left={() => <List.Icon icon="bell" />}
          onPress={() => { /* Navigate to notification settings */ }}
        />
        <Divider />
      </List.Section>
      <Button 
        mode="contained" 
        onPress={handleLogout} 
        style={styles.logoutButton}
        icon="logout"
      >
        로그아웃
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 32,
  },
  avatar: {
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  logoutButton: {
    marginTop: 32,
  },
});

export default ProfileScreen;
