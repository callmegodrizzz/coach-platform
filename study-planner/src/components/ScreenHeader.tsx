import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { space, type } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const { c } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.text}>
        <Text style={[type.display, { color: c.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[type.label, { color: c.textMuted, marginTop: 2 }]}>{subtitle}</Text>
        )}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    paddingBottom: space.lg,
    gap: space.md,
  },
  text: { flex: 1 },
});
