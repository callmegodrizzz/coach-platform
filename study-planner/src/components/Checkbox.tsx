import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { spring } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import * as haptics from '@/lib/haptics';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SIZE = 28;
const CHECK = 'M7 14.5 L12 19 L21 9.5';
const CHECK_LENGTH = 26;

type Props = {
  checked: boolean;
  onToggle: () => void;
  color: string;
  size?: number;
};

/**
 * Чекбокс: обводка сжимается, заливка появляется пружиной, галочка
 * прорисовывается штрихом. Полный цикл ~280 мс + haptic.
 */
export function Checkbox({ checked, onToggle, color, size = SIZE }: Props) {
  const { c } = useTheme();
  const progress = useSharedValue(checked ? 1 : 0);
  const pop = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 220 });
  }, [checked, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.6 + progress.value * 0.4 }],
  }));

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
    borderColor: progress.value > 0.5 ? color : c.borderStrong,
  }));

  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - progress.value),
  }));

  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        pop.value = withSequence(
          withTiming(0.86, { duration: 90 }),
          withSpring(1, spring),
        );
        if (!checked) haptics.success();
        else haptics.tap();
        onToggle();
      }}
    >
      <Animated.View
        style={[
          styles.box,
          { width: size, height: size, borderRadius: size * 0.33 },
          boxStyle,
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: color, borderRadius: size * 0.33 },
            fillStyle,
          ]}
        />
        <View style={StyleSheet.absoluteFill}>
          <Svg width={size} height={size} viewBox="0 0 28 28">
            <AnimatedPath
              d={CHECK}
              stroke="#FFFFFF"
              strokeWidth={3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={CHECK_LENGTH}
              animatedProps={checkProps}
            />
          </Svg>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
