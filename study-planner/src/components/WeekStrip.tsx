import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { palette, radius, space, spring, type } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { addDays, fromISO, lessonsOn, today, weekdayShort, type ISODate } from '@/lib/dates';
import * as haptics from '@/lib/haptics';

type Props = {
  monday: ISODate;
  selected: ISODate;
  onSelect: (date: ISODate) => void;
  /** Сколько задач запланировано на каждый день — рисуется точкой. */
  taskCounts: Record<ISODate, number>;
};

/** Полоска недели: день, число, метки пар и задач. */
export function WeekStrip({ monday, selected, onSelect, taskCounts }: Props) {
  const { c } = useTheme();
  const t = today();
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  return (
    <View style={styles.row}>
      {days.map((date) => (
        <Day
          key={date}
          date={date}
          selected={date === selected}
          isToday={date === t}
          hasLessons={lessonsOn(date).length > 0}
          taskCount={taskCounts[date] ?? 0}
          onPress={() => {
            haptics.select();
            onSelect(date);
          }}
        />
      ))}
    </View>
  );
}

function Day({
  date,
  selected,
  isToday,
  hasLessons,
  taskCount,
  onPress,
}: {
  date: ISODate;
  selected: boolean;
  isToday: boolean;
  hasLessons: boolean;
  taskCount: number;
  onPress: () => void;
}) {
  const { c } = useTheme();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      style={styles.dayWrap}
      onPressIn={() => {
        scale.value = withSpring(0.92, spring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring);
      }}
      onPress={onPress}
    >
      <Animated.View style={style}>
        <Text style={[type.micro, styles.wd, { color: selected ? c.text : c.textFaint }]}>
          {weekdayShort(date).toUpperCase()}
        </Text>
        <View
          style={[
            styles.pill,
            selected && { backgroundColor: c.text },
            !selected && isToday && { borderWidth: 2, borderColor: palette.green },
          ]}
        >
          <Text
            style={[
              type.heading,
              { color: selected ? c.bg : isToday ? palette.green : c.text },
            ]}
          >
            {fromISO(date).getDate()}
          </Text>
        </View>
        <View style={styles.dots}>
          <View
            style={[
              styles.dot,
              { backgroundColor: hasLessons ? (selected ? c.text : c.textFaint) : 'transparent' },
            ]}
          />
          <View
            style={[
              styles.dot,
              { backgroundColor: taskCount > 0 ? palette.green : 'transparent' },
            ]}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: space.md,
  },
  dayWrap: { flex: 1, alignItems: 'center' },
  wd: { marginBottom: 6 },
  pill: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', gap: 3, height: 10, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
