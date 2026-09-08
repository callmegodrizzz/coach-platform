import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { radius, spring, subjectPalette, type } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import type { Subject } from '@/data/schedule';
import * as haptics from '@/lib/haptics';

export function subjectColors(subject: Subject, isDark: boolean) {
  const p = subjectPalette[subject.color];
  return {
    base: p.base,
    dark: p.dark,
    soft: isDark ? p.softDark : p.soft,
  };
}

type Props = {
  subject: Subject;
  count?: number;
  selected?: boolean;
  onPress: () => void;
};

/** Цветной чип предмета со счётчиком открытых заданий. */
export function SubjectChip({ subject, count = 0, selected, onPress }: Props) {
  const { isDark } = useTheme();
  const colors = subjectColors(subject, isDark);
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.94, spring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring);
      }}
      onPress={() => {
        haptics.select();
        onPress();
      }}
    >
      <Animated.View
        style={[
          styles.chip,
          {
            backgroundColor: selected ? colors.base : colors.soft,
            borderColor: selected ? colors.dark : 'transparent',
          },
          style,
        ]}
      >
        <Text
          style={[
            type.label,
            { color: selected ? '#FFFFFF' : isDark ? colors.base : colors.dark },
          ]}
          numberOfLines={1}
        >
          {subject.short}
        </Text>
        {count > 0 && (
          <View
            style={[
              styles.badge,
              { backgroundColor: selected ? 'rgba(255,255,255,0.28)' : colors.base },
            ]}
          >
            <Text style={[type.micro, { color: '#FFFFFF' }]}>{count}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

/** Нейтральный чип — «Все», фильтры, быстрые даты. */
export function PlainChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onPress();
      }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? c.text : c.surfaceAlt,
          borderColor: 'transparent',
        },
      ]}
    >
      <Text style={[type.label, { color: selected ? c.bg : c.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 2,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
});
