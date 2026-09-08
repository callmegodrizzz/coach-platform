import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { schemes, type ColorScheme } from './tokens';

type ThemeValue = {
  c: ColorScheme;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeValue>({ c: schemes.light, isDark: false });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const value = useMemo<ThemeValue>(
    () => ({ c: isDark ? schemes.dark : schemes.light, isDark }),
    [isDark],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
