import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { SUBJECTS, type SubjectId } from '@/data/schedule';
import { useStore } from '@/lib/store';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BucketSections } from '@/components/BucketSections';
import { PlainChip, SubjectChip } from '@/components/SubjectChip';
import { EmptyState } from '@/components/EmptyState';
import { ProgressRing } from '@/components/ProgressRing';
import { Fab } from '@/components/Fab';
import { QuickAddSheet, type QuickAddPreset } from '@/components/QuickAddSheet';

export default function DeadlinesScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const items = useStore((s) => s.items);

  const [filter, setFilter] = useState<SubjectId | null>(null);
  const [addVisible, setAddVisible] = useState(false);
  const [preset, setPreset] = useState<QuickAddPreset | undefined>();

  const homework = useMemo(() => items.filter((it) => it.kind === 'homework'), [items]);
  const open = useMemo(() => homework.filter((it) => !it.done), [homework]);

  const counts = useMemo(() => {
    const map = {} as Record<SubjectId, number>;
    for (const s of SUBJECTS) map[s.id] = open.filter((it) => it.subjectId === s.id).length;
    return map;
  }, [open]);

  const visible = useMemo(
    () => (filter ? open.filter((it) => it.subjectId === filter) : open),
    [open, filter],
  );

  const doneCount = homework.filter((it) => it.done).length;

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
          title="Дедлайны"
          subtitle={
            open.length === 0
              ? 'Всё закрыто'
              : `${open.length} открыто · ${doneCount} сделано`
          }
          right={
            <ProgressRing
              done={doneCount}
              total={homework.length}
              color={palette.green}
            />
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <PlainChip label="Все" selected={filter === null} onPress={() => setFilter(null)} />
          {SUBJECTS.map((s) => (
            <SubjectChip
              key={s.id}
              subject={s}
              count={counts[s.id]}
              selected={filter === s.id}
              onPress={() => setFilter(filter === s.id ? null : s.id)}
            />
          ))}
        </ScrollView>

        {visible.length === 0 ? (
          <EmptyState
            emoji="🎉"
            title={filter ? 'По этому предмету пусто' : 'Домашки нет'}
            hint="Нажми + или добавь задание прямо с карточки пары"
          />
        ) : (
          <BucketSections items={visible} />
        )}
      </ScrollView>

      <Fab
        onPress={() => {
          setPreset({ kind: 'homework', subjectId: filter ?? undefined });
          setAddVisible(true);
        }}
      />
      <QuickAddSheet visible={addVisible} preset={preset} onClose={() => setAddVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: space.lg },
  chipRow: { gap: space.sm, paddingHorizontal: space.xl },
});
