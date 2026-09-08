import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, radius, space, subjectPalette, type } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { SUBJECTS, SUBJECT_BY_ID, type SubjectId } from '@/data/schedule';
import { formatRelative, type ISODate } from '@/lib/dates';
import { useStore } from '@/lib/store';
import { Checkbox } from '@/components/Checkbox';
import { SubjectChip } from '@/components/SubjectChip';
import { MonthGrid } from '@/components/MonthGrid';
import { ChunkyButton } from '@/components/ChunkyButton';
import { Sheet } from '@/components/Sheet';
import * as haptics from '@/lib/haptics';

export default function TaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const item = useStore((s) => s.items.find((it) => it.id === id));
  const update = useStore((s) => s.update);
  const remove = useStore((s) => s.remove);
  const toggleDone = useStore((s) => s.toggleDone);
  const addSubtask = useStore((s) => s.addSubtask);
  const toggleSubtask = useStore((s) => s.toggleSubtask);
  const removeSubtask = useStore((s) => s.removeSubtask);

  const [newSubtask, setNewSubtask] = useState('');
  const [picker, setPicker] = useState<'due' | 'plan' | null>(null);

  const accent = useMemo(() => {
    if (!item?.subjectId) return palette.green;
    return subjectPalette[SUBJECT_BY_ID[item.subjectId].color].base;
  }, [item?.subjectId]);

  if (!item) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: c.bg }]}>
        <Text style={[type.body, { color: c.textMuted }]}>Задача удалена</Text>
      </View>
    );
  }

  const confirmDelete = () => {
    Alert.alert('Удалить задачу?', item.title, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          haptics.warn();
          remove(item.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.topBar, { paddingTop: space.md }]}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={26} color={c.textMuted} />
        </Pressable>
        <Pressable hitSlop={12} onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={22} color={palette.red} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleRow}>
          <Checkbox
            checked={item.done}
            color={accent}
            size={32}
            onToggle={() => toggleDone(item.id)}
          />
          <TextInput
            value={item.title}
            onChangeText={(t) => update(item.id, { title: t })}
            multiline
            style={[
              type.title,
              styles.titleInput,
              {
                color: item.done ? c.textFaint : c.text,
                textDecorationLine: item.done ? 'line-through' : 'none',
              },
            ]}
            placeholder="Без названия"
            placeholderTextColor={c.textFaint}
          />
        </View>

        {item.kind === 'homework' && (
          <Field label="Предмет">
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
                  selected={item.subjectId === s.id}
                  onPress={() =>
                    update(item.id, {
                      subjectId: item.subjectId === s.id ? undefined : (s.id as SubjectId),
                    })
                  }
                />
              ))}
            </ScrollView>
          </Field>
        )}

        <View style={styles.dateGrid}>
          <DateTile
            label="Сдать"
            icon="flag-outline"
            value={item.dueAt}
            accent={accent}
            onPress={() => setPicker('due')}
          />
          <DateTile
            label="Делать"
            icon="play-outline"
            value={item.plannedFor}
            accent={accent}
            onPress={() => setPicker('plan')}
          />
        </View>

        <Field label="Заметки">
          <TextInput
            value={item.notes}
            onChangeText={(t) => update(item.id, { notes: t })}
            multiline
            placeholder="Условие, ссылка, что именно надо сделать…"
            placeholderTextColor={c.textFaint}
            style={[
              type.bodyRegular,
              styles.notes,
              { color: c.text, backgroundColor: c.surface, borderColor: c.border },
            ]}
          />
        </Field>

        <Field label="Шаги">
          <View style={styles.subtasks}>
            {item.subtasks.map((s) => (
              <Animated.View key={s.id} layout={LinearTransition.springify()} style={styles.subtaskRow}>
                <Checkbox
                  checked={s.done}
                  color={accent}
                  size={24}
                  onToggle={() => toggleSubtask(item.id, s.id)}
                />
                <Text
                  style={[
                    type.bodyRegular,
                    styles.subtaskText,
                    {
                      color: s.done ? c.textFaint : c.text,
                      textDecorationLine: s.done ? 'line-through' : 'none',
                    },
                  ]}
                >
                  {s.title}
                </Text>
                <Pressable hitSlop={10} onPress={() => removeSubtask(item.id, s.id)}>
                  <Ionicons name="close" size={18} color={c.textFaint} />
                </Pressable>
              </Animated.View>
            ))}

            <View style={[styles.subtaskAdd, { borderColor: c.border }]}>
              <Ionicons name="add" size={20} color={c.textFaint} />
              <TextInput
                value={newSubtask}
                onChangeText={setNewSubtask}
                placeholder="Добавить шаг"
                placeholderTextColor={c.textFaint}
                style={[type.bodyRegular, styles.subtaskInput, { color: c.text }]}
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (!newSubtask.trim()) return;
                  addSubtask(item.id, newSubtask);
                  setNewSubtask('');
                  haptics.tap();
                }}
              />
            </View>
          </View>
        </Field>
      </ScrollView>

      <Sheet visible={picker !== null} onClose={() => setPicker(null)}>
        <View style={styles.pickerHeader}>
          <Text style={[type.heading, { color: c.text }]}>
            {picker === 'due' ? 'Когда сдавать' : 'Когда делать'}
          </Text>
          <Pressable
            hitSlop={10}
            onPress={() => {
              update(item.id, picker === 'due' ? { dueAt: undefined } : { plannedFor: undefined });
              setPicker(null);
            }}
          >
            <Text style={[type.label, { color: c.textMuted }]}>Сброс</Text>
          </Pressable>
        </View>
        <MonthGrid
          accent={accent}
          value={picker === 'due' ? item.dueAt : item.plannedFor}
          onSelect={(d: ISODate) => {
            update(item.id, picker === 'due' ? { dueAt: d } : { plannedFor: d });
            setPicker(null);
          }}
        />
        <ChunkyButton
          label="Закрыть"
          onPress={() => setPicker(null)}
          color={accent}
          shadowColor={
            item.subjectId ? subjectPalette[SUBJECT_BY_ID[item.subjectId].color].dark : palette.greenDark
          }
          style={styles.pickerClose}
        />
      </Sheet>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[type.caption, { color: c.textFaint, paddingHorizontal: space.xl }]}>
        {label.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

function DateTile({
  label,
  icon,
  value,
  accent,
  onPress,
}: {
  label: string;
  icon: any;
  value?: ISODate;
  accent: string;
  onPress: () => void;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onPress();
      }}
      style={[styles.dateTile, { backgroundColor: c.surface, borderColor: c.border }]}
    >
      <View style={styles.dateTileTop}>
        <Ionicons name={icon} size={15} color={c.textFaint} />
        <Text style={[type.caption, { color: c.textFaint }]}>{label.toUpperCase()}</Text>
      </View>
      <Text style={[type.body, { color: value ? accent : c.textFaint }]}>
        {value ? formatRelative(value) : 'Не задано'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingBottom: space.sm,
  },
  content: { gap: space.xl },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    paddingHorizontal: space.xl,
  },
  titleInput: { flex: 1, paddingTop: 0, minHeight: 34 },
  field: { gap: space.sm },
  chipRow: { gap: space.sm, paddingHorizontal: space.xl },
  dateGrid: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.xl },
  dateTile: {
    flex: 1,
    gap: 6,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  dateTileTop: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  notes: {
    marginHorizontal: space.xl,
    minHeight: 90,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    textAlignVertical: 'top',
  },
  subtasks: { paddingHorizontal: space.xl, gap: space.md },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  subtaskText: { flex: 1 },
  subtaskAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  subtaskInput: { flex: 1, padding: 0 },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.lg,
  },
  pickerClose: { marginTop: space.lg },
});
