/**
 * Работа с датами. Везде используется локальная дата в формате 'YYYY-MM-DD'
 * без времени и без таймзон — так не бывает сдвигов на день.
 */

import {
  ANCHOR_MONDAY,
  ANCHOR_WEEK_TYPE,
  LESSONS,
  SLOTS,
  type Lesson,
  type WeekType,
} from '@/data/schedule';

export type ISODate = string; // 'YYYY-MM-DD'

const MS_PER_DAY = 86_400_000;

export function toISO(d: Date): ISODate {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISO(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function today(): ISODate {
  return toISO(new Date());
}

export function addDays(iso: ISODate, n: number): ISODate {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function diffDays(a: ISODate, b: ISODate): number {
  // Полдень нейтрализует переходы на летнее время.
  const da = fromISO(a).setHours(12, 0, 0, 0);
  const db = fromISO(b).setHours(12, 0, 0, 0);
  return Math.round((da - db) / MS_PER_DAY);
}

/** 1 = понедельник … 7 = воскресенье */
export function weekday(iso: ISODate): number {
  const js = fromISO(iso).getDay();
  return js === 0 ? 7 : js;
}

export function mondayOf(iso: ISODate): ISODate {
  return addDays(iso, -(weekday(iso) - 1));
}

/** Чередование лекционных и семинарских недель относительно недели-якоря. */
export function weekTypeOf(iso: ISODate): WeekType {
  const weeks = Math.floor(diffDays(mondayOf(iso), ANCHOR_MONDAY) / 7);
  const even = ((weeks % 2) + 2) % 2 === 0;
  if (even) return ANCHOR_WEEK_TYPE;
  return ANCHOR_WEEK_TYPE === 'lectures' ? 'seminars' : 'lectures';
}

/** Пары на конкретную дату, отсортированные по времени. */
export function lessonsOn(iso: ISODate): Lesson[] {
  const wd = weekday(iso);
  const wt = weekTypeOf(iso);
  return LESSONS.filter(
    (l) => l.weekday === wd && (l.weeks === 'both' || l.weeks === wt),
  ).sort((a, b) => a.slot - b.slot);
}

/** Дата и время начала пары как Date — нужно для уведомлений. */
export function lessonStartsAt(iso: ISODate, slot: number): Date {
  const [h, m] = SLOTS[slot].start.split(':').map(Number);
  const d = fromISO(iso);
  d.setHours(h, m, 0, 0);
  return d;
}

const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WEEKDAYS_FULL = [
  'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье',
];

export function weekdayShort(iso: ISODate): string {
  return WEEKDAYS_SHORT[weekday(iso) - 1];
}

export function weekdayFull(iso: ISODate): string {
  return WEEKDAYS_FULL[weekday(iso) - 1];
}

/** «3 сентября» */
export function formatDay(iso: ISODate): string {
  const d = fromISO(iso);
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
}

/** «Сегодня» / «Завтра» / «Вчера» / «Пн, 7 сентября» */
export function formatRelative(iso: ISODate): string {
  const delta = diffDays(iso, today());
  if (delta === 0) return 'Сегодня';
  if (delta === 1) return 'Завтра';
  if (delta === -1) return 'Вчера';
  return `${weekdayShort(iso)}, ${formatDay(iso)}`;
}

/** Короткая подпись дедлайна для карточки: «через 3 дня», «просрочено на 2 дня». */
export function formatDeadline(iso: ISODate): string {
  const delta = diffDays(iso, today());
  if (delta === 0) return 'Сегодня';
  if (delta === 1) return 'Завтра';
  if (delta === -1) return 'Вчера';
  if (delta < 0) return `Просрочено на ${plural(-delta, 'день', 'дня', 'дней')}`;
  if (delta <= 6) return `${weekdayShort(iso)}, через ${plural(delta, 'день', 'дня', 'дней')}`;
  return formatDay(iso);
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  let word = many;
  if (mod10 === 1 && mod100 !== 11) word = one;
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = few;
  return `${n} ${word}`;
}

/** Ближайшая дата (начиная с завтрашнего дня), когда есть пара по предмету. */
export function nextLessonFor(subjectId: string, from: ISODate = today()): { date: ISODate; lesson: Lesson } | null {
  for (let i = 0; i < 21; i++) {
    const date = addDays(from, i);
    const lesson = lessonsOn(date).find((l) => l.subjectId === subjectId);
    if (lesson) {
      if (i === 0) {
        // Сегодняшняя пара считается, только если она ещё не началась.
        if (lessonStartsAt(date, lesson.slot).getTime() > Date.now()) return { date, lesson };
        continue;
      }
      return { date, lesson };
    }
  }
  return null;
}
