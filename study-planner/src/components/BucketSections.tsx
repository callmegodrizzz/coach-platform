import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { palette, radius, space, type } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { bucketize, useStore, type Item } from '@/lib/store';
import { TaskCard } from './TaskCard';
import { SwipeRow } from './SwipeRow';

/** Секции «Просрочено / Сегодня / Завтра / …» с общими свайпами. */
export function BucketSections({
  items,
  showSubject = true,
}: {
  items: Item[];
  showSubject?: boolean;
}) {
  const { c } = useTheme();
  const toggleDone = useStore((s) => s.toggleDone);
  const postpone = useStore((s) => s.postpone);
  const buckets = bucketize(items);

  return (
    <View style={styles.wrap}>
      {buckets.map((bucket) => (
        <Animated.View
          key={bucket.key}
          entering={FadeIn.duration(200)}
          layout={LinearTransition.springify()}
          style={styles.section}
        >
          <View style={styles.titleRow}>
            <Text
              style={[
                type.heading,
                {
                  color:
                    bucket.tone === 'danger'
                      ? palette.red
                      : bucket.tone === 'accent'
                        ? c.text
                        : c.textMuted,
                },
              ]}
            >
              {bucket.title}
            </Text>
            <View
              style={[
                styles.count,
                {
                  backgroundColor:
                    bucket.tone === 'danger' ? palette.red : c.surfaceAlt,
                },
              ]}
            >
              <Text
                style={[
                  type.micro,
                  { color: bucket.tone === 'danger' ? '#FFFFFF' : c.textMuted },
                ]}
              >
                {bucket.items.length}
              </Text>
            </View>
          </View>

          <View style={styles.list}>
            {bucket.items.map((item) => (
              <SwipeRow
                key={item.id}
                onComplete={() => toggleDone(item.id)}
                onPostpone={() => postpone(item.id, 1)}
              >
                <TaskCard
                  item={item}
                  showSubject={showSubject}
                  onToggle={() => toggleDone(item.id)}
                  onPress={() => router.push({ pathname: '/task/[id]', params: { id: item.id } })}
                />
              </SwipeRow>
            ))}
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xl },
  section: { gap: space.md },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
  },
  count: {
    minWidth: 22,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  list: { gap: space.md, paddingHorizontal: space.xl },
});
