import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { chunk, radius, spring, type } from '@/theme/tokens';
import * as haptics from '@/lib/haptics';

type Props = {
  label: string;
  onPress: () => void;
  color: string;
  shadowColor: string;
  textColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
};

/**
 * Кнопка с нижней «толщиной»: при нажатии проваливается на всю высоту подложки.
 * Фирменный тактильный приём Duolingo — самая заметная деталь интерфейса.
 */
export function ChunkyButton({
  label,
  onPress,
  color,
  shadowColor,
  textColor = '#FFFFFF',
  disabled,
  style,
  icon,
}: Props) {
  const pressed = useSharedValue(0);

  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(pressed.value * chunk, spring) }],
  }));

  return (
    <View style={[styles.wrap, { opacity: disabled ? 0.45 : 1 }, style]}>
      <View style={[styles.shadow, { backgroundColor: shadowColor }]} />
      <Pressable
        disabled={disabled}
        onPressIn={() => {
          pressed.value = 1;
          haptics.tap();
        }}
        onPressOut={() => {
          pressed.value = 0;
        }}
        onPress={onPress}
      >
        <Animated.View style={[styles.face, { backgroundColor: color }, faceStyle]}>
          {icon}
          <Text style={[type.body, styles.label, { color: textColor }]}>{label}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: chunk,
    bottom: 0,
    borderRadius: radius.lg,
  },
  face: {
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    letterSpacing: 0.2,
  },
});
