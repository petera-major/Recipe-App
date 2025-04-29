import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: 'SmartPantryMuse',
        headerTitleAlign:'center',
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#564a45',
        },
        tabBarActiveTintColor: '#F1C27B',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          backgroundColor: '#FFF5F0',
          borderTopWidth: 0.5,
          borderTopColor: '#ddd',
        },
      }}
    >
      <Tabs.Screen
        name="result"
        options={{
          title: 'result',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AIchef',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs> 
  );
}