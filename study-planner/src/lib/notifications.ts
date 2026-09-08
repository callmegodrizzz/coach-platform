/**
 * Уведомления.
 *
 * Два типа, как ты просил:
 *   1) за час до первой пары дня — «в 9:50 ТВМС, ауд. 26»;
 *   2) каждый день в 17:00 — сводка по невыполненным домашкам.
 *
 * iOS хранит максимум 64 запланированных локальных уведомления, поэтому
 * приложение планирует окно на ближайшие 14 дней и полностью пересобирает
 * расписание уведомлений при каждом запуске и возврате из фона.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  LESSON_KIND_LABEL,
  SLOTS,
  SUBJECT_BY_ID,
} from '@/data/schedule';
import {
  addDays,
  diffDays,
  fromISO,
  lessonsOn,
  lessonStartsAt,
  plural,
  today,
} from './dates';
import { effectiveDate, type Item } from './store';

/** На сколько дней вперёд планируем. 14 дней × 2 уведомления ≈ 28 < 64. */
const HORIZON_DAYS = 14;
const IOS_LIMIT = 60;
const DIGEST_HOUR = 17;
const LESSON_LEAD_MINUTES = 60;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensurePermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Напоминания',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#58CC02',
  });
}

type Planned = {
  date: Date;
  title: string;
  body: string;
};

function planLessonReminders(): Planned[] {
  const out: Planned[] = [];
  const start = today();

  for (let i = 0; i < HORIZON_DAYS; i++) {
    const date = addDays(start, i);
    const lessons = lessonsOn(date);
    if (lessons.length === 0) continue;

    const first = lessons[0];
    const fireAt = new Date(
      lessonStartsAt(date, first.slot).getTime() - LESSON_LEAD_MINUTES * 60_000,
    );
    if (fireAt.getTime() <= Date.now() + 60_000) continue;

    const subject = SUBJECT_BY_ID[first.subjectId];
    const rest = lessons.length - 1;
    const tail = rest > 0 ? ` Дальше ещё ${plural(rest, 'пара', 'пары', 'пар')}.` : '';

    out.push({
      date: fireAt,
      title: `Через час — ${subject.short}`,
      body:
        `${SLOTS[first.slot].start} · ${LESSON_KIND_LABEL[first.kind]} · ауд. ${first.room}.` +
        tail,
    });
  }

  return out;
}

function planHomeworkDigests(items: Item[]): Planned[] {
  const out: Planned[] = [];
  const start = today();

  for (let i = 0; i < HORIZON_DAYS; i++) {
    const date = addDays(start, i);
    const fireAt = fromISO(date);
    fireAt.setHours(DIGEST_HOUR, 0, 0, 0);
    if (fireAt.getTime() <= Date.now() + 60_000) continue;

    // Что будет актуально на тот момент: незакрытая домашка со сроком до этого дня +
    // ближайшая неделя после него.
    const relevant = items.filter((it) => {
      if (it.done || it.kind !== 'homework') return false;
      const due = effectiveDate(it);
      if (!due) return false;
      const delta = diffDays(due, date);
      return delta <= 7;
    });

    if (relevant.length === 0) continue;

    const overdueCount = relevant.filter((it) => diffDays(effectiveDate(it)!, date) < 0).length;
    const preview = relevant
      .slice(0, 3)
      .map((it) => {
        const subject = it.subjectId ? SUBJECT_BY_ID[it.subjectId].short : 'Без предмета';
        return `${subject}: ${it.title}`;
      })
      .join('\n');
    const more = relevant.length > 3 ? `\n…и ещё ${relevant.length - 3}` : '';

    out.push({
      date: fireAt,
      title:
        overdueCount > 0
          ? `${plural(overdueCount, 'просроченная задача', 'просроченные задачи', 'просроченных задач')}`
          : `Домашка: ${plural(relevant.length, 'задача', 'задачи', 'задач')}`,
      body: preview + more,
    });
  }

  return out;
}

/**
 * Полностью пересобирает расписание уведомлений.
 * Вызывается при старте приложения, при возврате из фона и после правки задач.
 */
export async function rescheduleAll(items: Item[]): Promise<void> {
  const granted = await ensurePermissions();
  if (!granted) return;

  await ensureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const planned = [...planLessonReminders(), ...planHomeworkDigests(items)]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, IOS_LIMIT);

  await Promise.all(
    planned.map((p) =>
      Notifications.scheduleNotificationAsync({
        content: { title: p.title, body: p.body, sound: true },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: p.date,
        },
      }),
    ),
  );
}
