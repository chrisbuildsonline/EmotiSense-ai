import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#FFFFFF',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 20,
          paddingTop: 12,
          paddingHorizontal: 20,
          position: 'absolute',
          elevation: 0,
        },
        tabBarBackground: () => (
          <View 
            style={{ 
              ...StyleSheet.absoluteFillObject, 
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -10 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 30,
            }}
          >
            <LinearGradient
              colors={['rgba(12, 30, 47, 0.98)', 'rgba(10, 20, 35, 0.98)', 'rgba(8, 13, 25, 0.98)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              }}
            />
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          fontFamily: 'Playfair',
          letterSpacing: 0.8,
          marginTop: 6,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Emotions',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'happy' : 'happy-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'settings' : 'settings-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
