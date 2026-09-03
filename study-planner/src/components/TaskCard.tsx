import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { palette, radius, space, type } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { SUBJECT_BY_ID } from '@/data/schedule';
import { effectiveDate, isOverdue, type Item } from '@/lib/store';
import { formatDeadline } from '@/lib/dates';
import { Checkbox } from './Checkbox';
import { subjectColors } from './SubjectChip';

type Props = {
  item: Item;
  onToggle: () => void;
  onPress: () => void;
  showSubject?: boolean;
};

export function TaskCard({ item, onToggle, onPress, showSubject = true }: Props) {
  const { c, isDark } = useTheme();
  const subject = item.subjectId ? SUBJECT_BY_ID[item.subjectId] : undefined;
  const colors = subject ? subjectColors(subject, isDark) : undefined;
  const accent = colors?.base ?? palette.green;
  const overdue = isOverdue(item);
  const date = effectiveDate(item);
  const doneSubtasks = item.subtasks.filter((s) => s.done).length;

  return (
    <Animated.View entering={FadeIn.duration(200)} layout={LinearTransition.springify()}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: c.card,
            borderColor: overdue ? palette.red : c.border,
          },
        ]}
      >
        <Checkbox checked={item.done} onToggle={onToggle} color={accent} />

        <View style={styles.body}>
          <Text
            style={[
              type.body,
              {
                color: item.done ? c.textFaint : c.text,
                textDecorationLine: item.done ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <View style={styles.metaRow}>
            {showSubject && subject && colors && (
              <View style={[styles.subjectPill, { backgroundColor: colors.soft }]}>
                <Text style={[type.micro, { color: isDark ? colors.base : colors.dark }]}>
                  {subject.short}
                </Text>
              </View>
            )}

            {date && (
              <Text
                style={[
                  type.caption,
                  { color: overdue ? palette.red : c.textMuted },
                ]}
              >
                {formatDeadline(date)}
              </Text>
            )}

            {item.subtasks.length > 0 && (
              <View style={styles.subtaskMeta}>
                <Ionicons name="list-outline" size={13} color={c.textFaint} />
                <Text style={[type.caption, { color: c.textFaint }]}>
                  {doneSubtasks}/{item.subtasks.length}
                </Text>
              </View>
            )}

            {item.notes.length > 0 && (
              <Ionicons name="document-text-outline" size={13} color={c.textFaint} />
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  body: { flex: 1, gap: 7, paddingTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  subjectPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  subtaskMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
