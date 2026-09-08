import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { palette, radius, space, spring, type } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import * as haptics from '@/lib/haptics';

const THRESHOLD = 92;
const MAX = 140;

type Props = {
  children: React.ReactNode;
  onComplete: () => void;
  onPostpone: () => void;
  /** У выполненных задач свайп «отложить» не нужен. */
  postponeEnabled?: boolean;
  completeLabel?: string;
};

/**
 * Свайп по карточке: вправо — «готово», влево — «на завтра».
 * За порогом действие подтверждается haptic-ом и иконка подрастает,
 * чтобы было понятно, что отпускать уже можно.
 */
export function SwipeRow({
  children,
  onComplete,
  onPostpone,
  postponeEnabled = true,
  completeLabel = 'Готово',
}: Props) {
  const { c } = useTheme();
  const x = useSharedValue(0);
  const crossed = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-14, 14])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      const raw = e.translationX;
      const limited = Math.sign(raw) * Math.min(Math.abs(raw), MAX);
      x.value = !postponeEnabled && limited < 0 ? limited * 0.25 : limited;

      const nowCrossed = Math.abs(x.value) >= THRESHOLD ? 1 : 0;
      if (nowCrossed !== crossed.value) {
        crossed.value = nowCrossed;
        if (nowCrossed) runOnJS(haptics.press)();
      }
    })
    .onEnd(() => {
      const v = x.value;
      if (v >= THRESHOLD) {
        x.value = withTiming(0, { duration: 180 });
        runOnJS(onComplete)();
      } else if (v <= -THRESHOLD && postponeEnabled) {
        x.value = withTiming(0, { duration: 180 });
        runOnJS(onPostpone)();
      } else {
        x.value = withSpring(0, spring);
      }
      crossed.value = 0;
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const leftStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, 30, THRESHOLD], [0, 0.6, 1], 'clamp'),
    transform: [
      { scale: interpolate(x.value, [0, THRESHOLD], [0.7, 1], 'clamp') },
    ],
  }));

  const rightStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, -30, -THRESHOLD], [0, 0.6, 1], 'clamp'),
    transform: [
      { scale: interpolate(x.value, [0, -THRESHOLD], [0.7, 1], 'clamp') },
    ],
  }));

  return (
    <View style={styles.wrap}>
      <View style={[styles.bg, { backgroundColor: c.surfaceAlt }]}>
        <Animated.View style={[styles.action, leftStyle]}>
          <Ionicons name="checkmark-circle" size={22} color={palette.green} />
          <Text style={[type.caption, { color: palette.green }]}>{completeLabel}</Text>
        </Animated.View>
        <Animated.View style={[styles.action, rightStyle]}>
          <Text style={[type.caption, { color: palette.amberDark }]}>На завтра</Text>
          <Ionicons name="arrow-forward-circle" size={22} color={palette.amberDark} />
        </Animated.View>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={cardStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
