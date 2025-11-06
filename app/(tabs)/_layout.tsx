import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'camera' : 'camera-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: 'Trends',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'analytics' : 'analytics-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
