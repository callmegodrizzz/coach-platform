import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { radius, space, spring, type } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import {
  LESSON_KIND_LABEL,
  SLOTS,
  SUBJECT_BY_ID,
  type Lesson,
} from '@/data/schedule';
import type { Item } from '@/lib/store';
import { formatDeadline } from '@/lib/dates';
import { subjectColors } from './SubjectChip';
import * as haptics from '@/lib/haptics';

type Props = {
  lesson: Lesson;
  homework: Item[];
  isNow?: boolean;
  onPress: () => void;
  onAddHomework: () => void;
};

/**
 * Карточка пары. Под ней сразу висит домашка по этому предмету —
 * ради этой связки всё приложение и делалось.
 */
export function LessonCard({ lesson, homework, isNow, onPress, onAddHomework }: Props) {
  const { c, isDark } = useTheme();
  const subject = SUBJECT_BY_ID[lesson.subjectId];
  const colors = subjectColors(subject, isDark);
  const slot = SLOTS[lesson.slot];
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeIn.duration(220)} style={animStyle}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.98, spring);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, spring);
        }}
        onPress={() => {
          haptics.tap();
          onPress();
        }}
        style={[
          styles.card,
          {
            backgroundColor: c.card,
            borderColor: isNow ? colors.base : c.border,
            borderWidth: isNow ? 2.5 : 1.5,
          },
        ]}
      >
        <View style={[styles.stripe, { backgroundColor: colors.base }]} />

        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={styles.times}>
              <Text style={[type.heading, { color: c.text }]}>{slot.start}</Text>
              <Text style={[type.caption, { color: c.textFaint }]}>{slot.end}</Text>
            </View>

            <View style={styles.titleBlock}>
              <View style={styles.titleRow}>
                <Text style={[type.heading, { color: c.text }]} numberOfLines={1}>
                  {subject.short}
                </Text>
                {isNow && (
                  <View style={[styles.nowPill, { backgroundColor: colors.base }]}>
                    <Text style={[type.micro, { color: '#FFFFFF' }]}>СЕЙЧАС</Text>
                  </View>
                )}
              </View>

              <View style={styles.metaRow}>
                <View style={[styles.kindPill, { backgroundColor: colors.soft }]}>
                  <Text style={[type.micro, { color: isDark ? colors.base : colors.dark }]}>
                    {LESSON_KIND_LABEL[lesson.kind].toUpperCase()}
                  </Text>
                </View>
                <Text style={[type.caption, { color: c.textMuted }]}>ауд. {lesson.room}</Text>
                <Text style={[type.caption, { color: c.textFaint }]}>·</Text>
                <Text style={[type.caption, { color: c.textMuted }]}>{subject.teacher}</Text>
              </View>
            </View>
          </View>

          {homework.length > 0 && (
            <View style={[styles.hwBlock, { borderTopColor: c.border }]}>
              {homework.slice(0, 3).map((hw) => (
                <View key={hw.id} style={styles.hwRow}>
                  <View style={[styles.dot, { backgroundColor: colors.base }]} />
                  <Text style={[type.bodyRegular, styles.hwTitle, { color: c.text }]} numberOfLines={1}>
                    {hw.title}
                  </Text>
                  {hw.dueAt && (
                    <Text style={[type.caption, { color: c.textFaint }]}>
                      {formatDeadline(hw.dueAt)}
                    </Text>
                  )}
                </View>
              ))}
              {homework.length > 3 && (
                <Text style={[type.caption, { color: c.textFaint, marginTop: 2 }]}>
                  ещё {homework.length - 3}
                </Text>
              )}
            </View>
          )}

          <Pressable
            onPress={() => {
              haptics.tap();
              onAddHomework();
            }}
            style={[styles.addRow, { borderTopColor: c.border }]}
            hitSlop={6}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.base} />
            <Text style={[type.label, { color: colors.base }]}>Задание по предмету</Text>
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  stripe: { width: 6 },
  body: { flex: 1, padding: space.lg },
  topRow: { flexDirection: 'row', gap: space.lg },
  times: { width: 54 },
  titleBlock: { flex: 1, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nowPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  kindPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  hwBlock: {
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1.5,
    gap: 7,
  },
  hwRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  hwTitle: { flex: 1, fontSize: 15 },
  addRow: {
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
