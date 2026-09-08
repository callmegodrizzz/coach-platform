import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chunk, palette, spring } from '@/theme/tokens';
import * as haptics from '@/lib/haptics';

const SIZE = 60;

/** Плавающая кнопка добавления. Та же «толщина», что у обычных кнопок. */
export function Fab({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  const pressed = useSharedValue(0);

  const faceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withSpring(pressed.value * chunk, spring) },
      { rotate: withSpring(`${pressed.value * 45}deg`, spring) },
    ],
  }));

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 74 }]} pointerEvents="box-none">
      <View style={styles.stack}>
        <View style={styles.shadow} />
        <Pressable
          onPressIn={() => {
            pressed.value = 1;
            haptics.press();
          }}
          onPressOut={() => {
            pressed.value = 0;
          }}
          onPress={onPress}
        >
          <Animated.View style={[styles.face, faceStyle]}>
            <Ionicons name="add" size={32} color="#FFFFFF" />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 20,
  },
  stack: { position: 'relative' },
  shadow: {
    position: 'absolute',
    left: 0,
    top: chunk,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: palette.greenDark,
  },
  face: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
