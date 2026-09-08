import React, { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { useStore } from '@/lib/store';
import { rescheduleAll } from '@/lib/notifications';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  const hydrated = useStore((s) => s.hydrated);
  const items = useStore((s) => s.items);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (fontsLoaded && hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, hydrated]);

  // Уведомления пересобираются целиком при старте, при возврате из фона
  // и после любой правки задач — так они всегда соответствуют данным.
  useEffect(() => {
    if (!hydrated) return;
    rescheduleAll(items).catch(() => {});
  }, [hydrated, items]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        rescheduleAll(useStore.getState().items).catch(() => {});
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded || !hydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Navigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Navigator() {
  const { c, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="subject/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="task/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
