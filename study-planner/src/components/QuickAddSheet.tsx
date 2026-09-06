import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, space, subjectPalette, type } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { SUBJECTS, SUBJECT_BY_ID, type SubjectId } from '@/data/schedule';
import {
  addDays,
  formatRelative,
  lessonChipLabel,
  nextLessonFor,
  nextLessonsFor,
  today,
  type ISODate,
} from '@/lib/dates';
import { useStore, type ItemKind, type NewItem } from '@/lib/store';
import * as haptics from '@/lib/haptics';
import { Sheet } from './Sheet';
import { SubjectChip } from './SubjectChip';
import { ChunkyButton } from './ChunkyButton';
import { MonthGrid } from './MonthGrid';

export type QuickAddPreset = {
  kind?: ItemKind;
  subjectId?: SubjectId;
  dueAt?: ISODate;
};

type Props = {
  visible: boolean;
  preset?: QuickAddPreset;
  onClose: () => void;
};

type Mode = 'compose' | 'due' | 'plan';

type DateOption = { value: ISODate; label: string };

const DEFAULT_DATE_OPTIONS = (): DateOption[] => [
  { value: today(), label: 'Сегодня' },
  { value: addDays(today(), 1), label: 'Завтра' },
];

/**
 * Быстрое добавление. Одна строка + чипы, клавиатура не закрывается.
 * Если открыто с карточки пары или с экрана предмета — предмет и дедлайн
 * (следующая пара по предмету) уже подставлены.
 */
export function QuickAddSheet({ visible, preset, onClose }: Props) {
  const { c, isDark } = useTheme();
  const add = useStore((s) => s.add);
  const inputRef = useRef<TextInput>(null);

  const [kind, setKind] = useState<ItemKind>('homework');
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<SubjectId | undefined>();
  const [dueAt, setDueAt] = useState<ISODate | undefined>();
  const [plannedFor, setPlannedFor] = useState<ISODate | undefined>();
  const [mode, setMode] = useState<Mode>('compose');

  useEffect(() => {
    if (!visible) return;
    setKind(preset?.kind ?? 'homework');
    setSubjectId(preset?.subjectId);
    setDueAt(preset?.dueAt);
    setPlannedFor(undefined);
    setTitle('');
    setMode('compose');
    const t = setTimeout(() => inputRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, [visible, preset]);

  const accent = useMemo(() => {
    if (kind === 'plan' || !subjectId) return palette.green;
    return subjectPalette[SUBJECT_BY_ID[subjectId].color].base;
  }, [kind, subjectId]);

  const accentDark = useMemo(() => {
    if (kind === 'plan' || !subjectId) return palette.greenDark;
    return subjectPalette[SUBJECT_BY_ID[subjectId].color].dark;
  }, [kind, subjectId]);

  /** Выбор предмета сам предлагает дедлайн — следующую пару по нему. */
  const chooseSubject = (id: SubjectId) => {
    const next = subjectId === id ? undefined : id;
    setSubjectId(next);
    if (next && !dueAt) {
      const lesson = nextLessonFor(next);
      if (lesson) setDueAt(lesson.date);
    }
  };

  /**
   * Домашку сдают к паре, поэтому при выбранном предмете «Сдать» предлагает
   * его ближайшие занятия, а не произвольные даты.
   */
  const dueOptions = useMemo<DateOption[]>(() => {
    if (kind === 'homework' && subjectId) {
      const lessons = nextLessonsFor(subjectId, 5);
      if (lessons.length) {
        return lessons.map((l, i) => ({ value: l.date, label: lessonChipLabel(i, l.date) }));
      }
    }
    return DEFAULT_DATE_OPTIONS();
  }, [kind, subjectId]);

  const planOptions = useMemo<DateOption[]>(() => DEFAULT_DATE_OPTIONS(), []);

  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const payload: NewItem = {
      kind,
      title,
      subjectId: kind === 'homework' ? subjectId : undefined,
      dueAt,
      plannedFor,
    };
    add(payload);
    haptics.success();
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      {mode !== 'compose' ? (
        <View style={styles.pickerWrap}>
          <View style={styles.pickerHeader}>
            <Pressable hitSlop={10} onPress={() => setMode('compose')}>
              <Ionicons name="chevron-back" size={24} color={c.textMuted} />
            </Pressable>
            <Text style={[type.heading, { color: c.text }]}>
              {mode === 'due' ? 'Когда сдавать' : 'Когда делать'}
            </Text>
            <Pressable
              hitSlop={10}
              onPress={() => {
                if (mode === 'due') setDueAt(undefined);
                else setPlannedFor(undefined);
                setMode('compose');
              }}
            >
              <Text style={[type.label, { color: c.textMuted }]}>Сброс</Text>
            </Pressable>
          </View>
          <MonthGrid
            accent={accent}
            value={mode === 'due' ? dueAt : plannedFor}
            onSelect={(d) => {
              if (mode === 'due') setDueAt(d);
              else setPlannedFor(d);
              setMode('compose');
            }}
          />
        </View>
      ) : (
        <View style={styles.wrap}>
          <View style={[styles.kindSwitch, { backgroundColor: c.surfaceAlt }]}>
            {(['homework', 'plan'] as ItemKind[]).map((k) => (
              <Pressable
                key={k}
                style={[
                  styles.kindOption,
                  kind === k && { backgroundColor: c.card },
                ]}
                onPress={() => {
                  haptics.select();
                  setKind(k);
                }}
              >
                <Text
                  style={[type.label, { color: kind === k ? c.text : c.textFaint }]}
                >
                  {k === 'homework' ? 'Домашка' : 'План'}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            ref={inputRef}
            value={title}
            onChangeText={setTitle}
            placeholder={kind === 'homework' ? 'Что задали?' : 'Что нужно сделать?'}
            placeholderTextColor={c.textFaint}
            style={[type.title, styles.input, { color: c.text }]}
            multiline
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={save}
          />

          {kind === 'homework' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
              keyboardShouldPersistTaps="always"
            >
              {SUBJECTS.map((s) => (
                <SubjectChip
                  key={s.id}
                  subject={s}
                  selected={subjectId === s.id}
                  onPress={() => chooseSubject(s.id)}
                />
              ))}
            </ScrollView>
          )}

          <View style={styles.dateRows}>
            <DateRow
              icon="flag"
              label="Сдать"
              value={dueAt}
              accent={accent}
              options={dueOptions}
              onQuick={(d) => setDueAt(d)}
              onOpen={() => setMode('due')}
            />
            <DateRow
              icon="play"
              label="Делать"
              value={plannedFor}
              accent={accent}
              options={planOptions}
              onQuick={(d) => setPlannedFor(d)}
              onOpen={() => setMode('plan')}
            />
          </View>

          <ChunkyButton
            label="Сохранить"
            onPress={save}
            disabled={!canSave}
            color={accent}
            shadowColor={accentDark}
            style={styles.save}
          />
        </View>
      )}
    </Sheet>
  );
}

function DateRow({
  icon,
  label,
  value,
  accent,
  options,
  onQuick,
  onOpen,
}: {
  icon: 'flag' | 'play';
  label: string;
  value?: ISODate;
  accent: string;
  options: DateOption[];
  onQuick: (d: ISODate) => void;
  onOpen: () => void;
}) {
  const { c } = useTheme();
  // Календарь подсвечен, только если выбранной даты нет среди быстрых вариантов.
  const custom = value !== undefined && !options.some((o) => o.value === value);

  return (
    <View style={styles.dateRow}>
      <View style={styles.dateLabel}>
        <Ionicons name={`${icon}-outline` as any} size={16} color={c.textFaint} />
        <Text style={[type.label, { color: c.textMuted }]}>{label}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.dateChips}
      >
        {options.map((o) => (
          <QuickDate
            key={o.value}
            label={o.label}
            active={value === o.value}
            onPress={() => onQuick(o.value)}
            accent={accent}
          />
        ))}

        <Pressable
          onPress={() => {
            haptics.select();
            onOpen();
          }}
          style={[styles.dateChip, { backgroundColor: custom ? accent : c.surfaceAlt }]}
        >
          <Ionicons
            name="calendar-outline"
            size={14}
            color={custom ? '#FFFFFF' : c.textMuted}
          />
          <Text style={[type.caption, { color: custom ? '#FFFFFF' : c.textMuted }]}>
            {custom ? formatRelative(value) : 'Дата'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function QuickDate({
  label,
  active,
  onPress,
  accent,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accent: string;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onPress();
      }}
      style={[styles.dateChip, { backgroundColor: active ? accent : c.surfaceAlt }]}
    >
      <Text style={[type.caption, { color: active ? '#FFFFFF' : c.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  pickerWrap: { gap: space.lg, paddingBottom: space.sm },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kindSwitch: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 3,
    alignSelf: 'flex-start',
  },
  kindOption: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  input: {
    minHeight: 40,
    maxHeight: 120,
    paddingTop: 0,
  },
  chipRow: { gap: space.sm, paddingRight: space.lg },
  dateRows: { gap: space.md },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  dateLabel: { flexDirection: 'row', alignItems: 'center', gap: 5, width: 84 },
  dateChips: { gap: space.sm, paddingRight: space.lg },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  save: { marginTop: space.xs },
});
