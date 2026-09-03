import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { space, type } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export function EmptyState({ emoji, title, hint }: { emoji: string; title: string; hint?: string }) {
  const { c } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(260)} style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[type.heading, { color: c.text, textAlign: 'center' }]}>{title}</Text>
      {hint && (
        <Text style={[type.bodyRegular, { color: c.textFaint, textAlign: 'center' }]}>{hint}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xxxl * 1.5,
    gap: space.sm,
  },
  emoji: { fontSize: 46, marginBottom: space.xs },
});
