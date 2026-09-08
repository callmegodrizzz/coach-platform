import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { radius, space, type } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import {
  addDays,
  fromISO,
  lessonsOn,
  mondayOf,
  toISO,
  today,
  weekday,
  type ISODate,
} from '@/lib/dates';
import * as haptics from '@/lib/haptics';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

type Props = {
  value?: ISODate;
  onSelect: (date: ISODate) => void;
  accent: string;
};

/** Календарь на месяц. Дни с парами помечены точкой. */
export function MonthGrid({ value, onSelect, accent }: Props) {
  const { c } = useTheme();
  const [cursor, setCursor] = useState<ISODate>(value ?? today());

  const { label, cells } = useMemo(() => {
    const d = fromISO(cursor);
    const first = toISO(new Date(d.getFullYear(), d.getMonth(), 1));
    const gridStart = mondayOf(first);
    const month = d.getMonth();

    const out: { date: ISODate; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const date = addDays(gridStart, i);
      out.push({ date, inMonth: fromISO(date).getMonth() === month });
      if (i >= 34 && weekday(date) === 7 && fromISO(addDays(date, 1)).getMonth() !== month) break;
    }
    return { label: `${MONTHS[month]} ${d.getFullYear()}`, cells: out };
  }, [cursor]);

  const t = today();

  const shift = (months: number) => {
    const d = fromISO(cursor);
    setCursor(toISO(new Date(d.getFullYear(), d.getMonth() + months, 1)));
    haptics.select();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={() => shift(-1)}>
          <Ionicons name="chevron-back" size={22} color={c.textMuted} />
        </Pressable>
        <Text style={[type.heading, { color: c.text }]}>{label}</Text>
        <Pressable hitSlop={10} onPress={() => shift(1)}>
          <Ionicons name="chevron-forward" size={22} color={c.textMuted} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WD.map((w) => (
          <Text key={w} style={[type.micro, styles.cell, { color: c.textFaint }]}>
            {w}
          </Text>
        ))}
      </View>

      <Animated.View entering={FadeIn.duration(160)} style={styles.grid}>
        {cells.map(({ date, inMonth }) => {
          const selected = date === value;
          const isToday = date === t;
          const hasLessons = lessonsOn(date).length > 0;
          return (
            <Pressable
              key={date}
              style={styles.cell}
              onPress={() => {
                haptics.select();
                onSelect(date);
              }}
            >
              <View
                style={[
                  styles.day,
                  selected && { backgroundColor: accent },
                  !selected && isToday && { borderWidth: 2, borderColor: accent },
                ]}
              >
                <Text
                  style={[
                    type.label,
                    {
                      color: selected
                        ? '#FFFFFF'
                        : inMonth
                          ? c.text
                          : c.textFaint,
                    },
                  ]}
                >
                  {fromISO(date).getDate()}
                </Text>
              </View>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      hasLessons && inMonth && !selected ? c.textFaint : 'transparent',
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.sm,
  },
  weekRow: { flexDirection: 'row' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 3,
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
});
