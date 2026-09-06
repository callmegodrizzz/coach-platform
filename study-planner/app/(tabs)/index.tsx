import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space, type } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import {
  SLOTS,
  SUBJECTS,
  WEEK_TYPE_LABEL,
  type SubjectId,
} from '@/data/schedule';
import {
  addDays,
  formatDay,
  lessonsOn,
  lessonStartsAt,
  mondayOf,
  today,
  weekdayFull,
  weekTypeOf,
  type ISODate,
} from '@/lib/dates';
import { effectiveDate, homeworkFor, useStore } from '@/lib/store';
import { ScreenHeader } from '@/components/ScreenHeader';
import { WeekStrip } from '@/components/WeekStrip';
import { LessonCard } from '@/components/LessonCard';
import { TaskCard } from '@/components/TaskCard';
import { SwipeRow } from '@/components/SwipeRow';
import { SubjectChip } from '@/components/SubjectChip';
import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { QuickAddSheet, type QuickAddPreset } from '@/components/QuickAddSheet';
import * as haptics from '@/lib/haptics';

export default function ScheduleScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const items = useStore((s) => s.items);
  const toggleDone = useStore((s) => s.toggleDone);
  const postpone = useStore((s) => s.postpone);

  const [selected, setSelected] = useState<ISODate>(today());
  const [addVisible, setAddVisible] = useState(false);
  const [preset, setPreset] = useState<QuickAddPreset | undefined>();

  // Экран живёт открытым часами, поэтому «СЕЙЧАС» и подписи дедлайнов
  // приходится пересчитывать по таймеру, иначе они застывают.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const monday = mondayOf(selected);
  const lessons = lessonsOn(selected);
  const weekType = weekTypeOf(selected);

  /** Точки на полоске недели: сколько задач запланировано на каждый день. */
  const taskCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const it of items) {
      if (it.done) continue;
      const d = effectiveDate(it);
      if (d) map[d] = (map[d] ?? 0) + 1;
    }
    return map;
  }, [items]);

  const dayTasks = useMemo(
    () => items.filter((it) => !it.done && effectiveDate(it) === selected),
    [items, selected],
  );

  const counts = useMemo(() => {
    const map = {} as Record<SubjectId, number>;
    for (const s of SUBJECTS) map[s.id] = homeworkFor(items, s.id).length;
    return map;
  }, [items]);

  const openAdd = (p?: QuickAddPreset) => {
    setPreset(p);
    setAddVisible(true);
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Расписание"
          subtitle={`${WEEK_TYPE_LABEL[weekType]} · ${weekdayFull(selected)}, ${formatDay(selected)}`}
          right={
            selected !== today() ? (
              <Pressable
                onPress={() => {
                  haptics.select();
                  setSelected(today());
                }}
                style={[styles.todayBtn, { backgroundColor: c.surfaceAlt }]}
              >
                <Text style={[type.label, { color: c.text }]}>Сегодня</Text>
              </Pressable>
            ) : undefined
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {SUBJECTS.map((s) => (
            <SubjectChip
              key={s.id}
              subject={s}
              count={counts[s.id]}
              onPress={() => router.push({ pathname: '/subject/[id]', params: { id: s.id } })}
            />
          ))}
        </ScrollView>

        <View style={styles.weekNav}>
          <Pressable hitSlop={12} onPress={() => setSelected(addDays(selected, -7))}>
            <Ionicons name="chevron-back" size={20} color={c.textFaint} />
          </Pressable>
          <View style={styles.weekStrip}>
            <WeekStrip
              monday={monday}
              selected={selected}
              onSelect={setSelected}
              taskCounts={taskCounts}
            />
          </View>
          <Pressable hitSlop={12} onPress={() => setSelected(addDays(selected, 7))}>
            <Ionicons name="chevron-forward" size={20} color={c.textFaint} />
          </Pressable>
        </View>

        <View style={styles.section}>
          {lessons.length === 0 ? (
            <EmptyState emoji="🌤" title="Пар нет" hint="Свободный день" />
          ) : (
            <View style={styles.list}>
              {lessons.map((lesson) => {
                const start = lessonStartsAt(selected, lesson.slot).getTime();
                const [eh, em] = SLOTS[lesson.slot].end.split(':').map(Number);
                const endDate = lessonStartsAt(selected, lesson.slot);
                endDate.setHours(eh, em, 0, 0);
                const isNow = nowMs >= start && nowMs <= endDate.getTime();

                return (
                  <LessonCard
                    key={`${lesson.subjectId}-${lesson.slot}`}
                    lesson={lesson}
                    isNow={isNow}
                    homework={homeworkFor(items, lesson.subjectId)}
                    onPress={() => router.push({ pathname: '/subject/[id]', params: { id: lesson.subjectId } })}
                    onAddHomework={() =>
                      openAdd({ kind: 'homework', subjectId: lesson.subjectId })
                    }
                  />
                );
              })}
            </View>
          )}
        </View>

        {dayTasks.length > 0 && (
          <Animated.View entering={FadeIn.duration(220)} style={styles.section}>
            <Text style={[type.heading, styles.sectionTitle, { color: c.textMuted }]}>
              Задачи на день
            </Text>
            <View style={styles.list}>
              {dayTasks.map((item) => (
                <SwipeRow
                  key={item.id}
                  onComplete={() => toggleDone(item.id)}
                  onPostpone={() => postpone(item.id, 1)}
                >
                  <TaskCard
                    item={item}
                    onToggle={() => toggleDone(item.id)}
                    onPress={() => router.push({ pathname: '/task/[id]', params: { id: item.id } })}
                  />
                </SwipeRow>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <Fab onPress={() => openAdd(undefined)} />
      <QuickAddSheet
        visible={addVisible}
        preset={preset}
        onClose={() => setAddVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: space.lg },
  chipRow: { gap: space.sm, paddingHorizontal: space.xl },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.sm,
  },
  weekStrip: { flex: 1 },
  section: { gap: space.md },
  sectionTitle: { paddingHorizontal: space.xl },
  list: { gap: space.md, paddingHorizontal: space.xl },
  todayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
});
