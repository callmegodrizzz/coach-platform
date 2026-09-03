import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { palette, font } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const { c, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.green,
        tabBarInactiveTintColor: c.textFaint,
        tabBarLabelStyle: { fontFamily: font.bold, fontSize: 11 },
        tabBarStyle: {
          position: 'absolute',
          borderTopColor: c.border,
          borderTopWidth: 1,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : c.bg,
          elevation: 0,
        },
        // Размытие только под таб-баром и заголовками — карточки остаются
        // плотными, иначе текст на них теряет читаемость.
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={70}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Расписание',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="deadlines"
        options={{
          title: 'Дедлайны',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flag" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Планы',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
