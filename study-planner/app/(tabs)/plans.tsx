import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { useStore } from '@/lib/store';
import { exportBackup } from '@/lib/backup';
import { plural } from '@/lib/dates';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BucketSections } from '@/components/BucketSections';
import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { QuickAddSheet } from '@/components/QuickAddSheet';
import * as haptics from '@/lib/haptics';

export default function PlansScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const items = useStore((s) => s.items);
  const [addVisible, setAddVisible] = useState(false);

  const plans = useMemo(() => items.filter((it) => it.kind === 'plan' && !it.done), [items]);

  const backup = async () => {
    haptics.tap();
    try {
      await exportBackup(items);
    } catch {
      Alert.alert('Не получилось', 'Резервную копию сохранить не удалось.');
    }
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
          title="Планы"
          subtitle={
            plans.length === 0
              ? 'Ничего не висит'
              : `${plural(plans.length, 'задача', 'задачи', 'задач')}`
          }
          right={
            <Pressable
              onPress={backup}
              style={[styles.iconBtn, { backgroundColor: c.surfaceAlt }]}
              hitSlop={8}
            >
              <Ionicons name="share-outline" size={20} color={c.textMuted} />
            </Pressable>
          }
        />

        {plans.length === 0 ? (
          <EmptyState
            emoji="🧘"
            title="Список пуст"
            hint="Сюда идёт всё, что не про учёбу"
          />
        ) : (
          <BucketSections items={plans} showSubject={false} />
        )}
      </ScrollView>

      <Fab onPress={() => setAddVisible(true)} />
      <QuickAddSheet
        visible={addVisible}
        preset={{ kind: 'plan' }}
        onClose={() => setAddVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: space.lg },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
