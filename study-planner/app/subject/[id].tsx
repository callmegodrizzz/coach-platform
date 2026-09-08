import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space, subjectPalette, type } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import {
  LESSON_KIND_LABEL,
  SLOTS,
  SUBJECT_BY_ID,
  type SubjectId,
} from '@/data/schedule';
import { formatRelative, nextLessonFor } from '@/lib/dates';
import { homeworkFor, useStore } from '@/lib/store';
import { BucketSections } from '@/components/BucketSections';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { QuickAddSheet } from '@/components/QuickAddSheet';
import * as haptics from '@/lib/haptics';

export default function SubjectScreen() {
  const { id } = useLocalSearchParams<{ id: SubjectId }>();
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const items = useStore((s) => s.items);
  const toggleDone = useStore((s) => s.toggleDone);

  const [addVisible, setAddVisible] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const subject = SUBJECT_BY_ID[id];
  const colors = subjectPalette[subject.color];
  const soft = isDark ? colors.softDark : colors.soft;

  const open = useMemo(() => homeworkFor(items, id), [items, id]);
  const done = useMemo(
    () => items.filter((it) => it.kind === 'homework' && it.subjectId === id && it.done),
    [items, id],
  );
  const next = useMemo(() => nextLessonFor(id), [id]);

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { backgroundColor: colors.base, paddingTop: insets.top + space.sm }]}>
          <Pressable
            hitSlop={12}
            onPress={() => {
              haptics.tap();
              router.back();
            }}
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </Pressable>

          <View style={styles.heroText}>
            <Text style={[type.display, { color: '#FFFFFF' }]}>{subject.short}</Text>
            <Text style={[type.bodyRegular, styles.heroFull]} numberOfLines={2}>
              {subject.full}
            </Text>

            <View style={styles.heroMeta}>
              <View style={styles.heroPill}>
                <Ionicons name="person-outline" size={13} color="#FFFFFF" />
                <Text style={[type.caption, { color: '#FFFFFF' }]}>{subject.teacher}</Text>
              </View>
              {subject.group && (
                <View style={styles.heroPill}>
                  <Text style={[type.caption, { color: '#FFFFFF' }]}>Группа {subject.group}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {next && (
          <View style={[styles.nextCard, { backgroundColor: soft }]}>
            <Ionicons name="time-outline" size={18} color={colors.base} />
            <Text style={[type.label, { color: isDark ? colors.base : colors.dark }]}>
              Следующая пара: {formatRelative(next.date)}, {SLOTS[next.lesson.slot].start} ·{' '}
              {LESSON_KIND_LABEL[next.lesson.kind]} · ауд. {next.lesson.room}
            </Text>
          </View>
        )}

        <View style={styles.body}>
          {open.length === 0 ? (
            <EmptyState emoji="✅" title="Заданий нет" hint="По этому предмету всё закрыто" />
          ) : (
            <BucketSections items={open} showSubject={false} />
          )}

          {done.length > 0 && (
            <View style={styles.doneBlock}>
              <Pressable
                onPress={() => {
                  haptics.select();
                  setShowDone((v) => !v);
                }}
                style={styles.doneToggle}
              >
                <Text style={[type.label, { color: c.textMuted }]}>
                  Сделано · {done.length}
                </Text>
                <Ionicons
                  name={showDone ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={c.textFaint}
                />
              </Pressable>

              {showDone && (
                <View style={styles.doneList}>
                  {done.map((item) => (
                    <TaskCard
                      key={item.id}
                      item={item}
                      showSubject={false}
                      onToggle={() => toggleDone(item.id)}
                      onPress={() => router.push({ pathname: '/task/[id]', params: { id: item.id } })}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <Fab onPress={() => setAddVisible(true)} />
      <QuickAddSheet
        visible={addVisible}
        preset={{ kind: 'homework', subjectId: id, dueAt: next?.date }}
        onClose={() => setAddVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  back: { marginBottom: space.md, marginLeft: -6 },
  heroText: { gap: 6 },
  heroFull: { color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 19 },
  heroMeta: { flexDirection: 'row', gap: space.sm, marginTop: space.sm, flexWrap: 'wrap' },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: space.xl,
    marginTop: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
  },
  body: { marginTop: space.xl, gap: space.xl },
  doneBlock: { gap: space.md },
  doneToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
  },
  doneList: { gap: space.md, paddingHorizontal: space.xl },
});
