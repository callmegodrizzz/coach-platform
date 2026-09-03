/**
 * ═══════════════════════════════════════════════════════════════════════
 *  ТВОЁ РАСПИСАНИЕ. Единственный файл, который нужно править руками.
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Группа: 2-ТЛ / Транспортная логистика
 *  Твои подгруппы: английский — E16, немецкий — D24
 *
 *  Недели чередуются: одна «лекционная», следующая «семинарская».
 *  Якорь — неделя с 31.08.2026 (на фото она лекционная: ОЭП.л, ТВМС.л, ТО1.л).
 *  Дальше приложение считает чётность само, переключать ничего не надо.
 *
 *  ⚠️  СЕМИНАРСКАЯ НЕДЕЛЯ ЗАПОЛНЕНА ПО ДОПУЩЕНИЮ: сетка та же, что и на
 *      лекционной, меняется только тип пары (и аудитория ОЭП — 207 вместо 26).
 *      Второе фото было обрезано, дни недели на нём не читались.
 *      Пришлёшь целый кадр — поправлю здесь, это 10 строк.
 */

import type { SubjectColorName } from '@/theme/tokens';

export type SubjectId = 'de' | 'en' | 'tvms' | 'oep' | 'vmnir' | 'to1';
export type LessonKind = 'lecture' | 'seminar' | 'practice';
export type WeekType = 'lectures' | 'seminars';

export type Subject = {
  id: SubjectId;
  /** Короткое имя — то, что видно в чипах и карточках. */
  short: string;
  /** Полное название, как в ведомости. */
  full: string;
  /** Код твоей подгруппы, если он есть. */
  group?: string;
  teacher: string;
  color: SubjectColorName;
};

export const SUBJECTS: Subject[] = [
  {
    id: 'tvms',
    short: 'ТВМС',
    full: 'Теория вероятностей и математическая статистика',
    teacher: 'Нкк / Nk',
    color: 'violet',
  },
  {
    id: 'de',
    short: 'Немецкий',
    full: 'Немецкий язык / Deutsch',
    group: 'D24',
    teacher: 'Кнк / Kn',
    color: 'red',
  },
  {
    id: 'en',
    short: 'Английский',
    full: 'Английский язык / Englisch',
    group: 'E16',
    teacher: 'Тгм / Tg',
    color: 'amber',
  },
  {
    id: 'to1',
    short: 'ТО1',
    full: 'Технические основы 1 / Technische Grundlagen 1',
    teacher: 'Клм / Kl',
    color: 'cyan',
  },
  {
    id: 'oep',
    short: 'ОЭП',
    full: 'Основы экономики предприятия (minor) / GBU',
    teacher: 'Атн / At',
    color: 'slate',
  },
  {
    id: 'vmnir',
    short: 'ВМНИР',
    full: 'Введение в методы научных исследований и риторика / EFR',
    teacher: 'Арм / Ar',
    color: 'pink',
  },
];

export const SUBJECT_BY_ID: Record<SubjectId, Subject> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s]),
) as Record<SubjectId, Subject>;

/** Сетка звонков университета. Номер пары -> время. */
export const SLOTS: Record<number, { start: string; end: string }> = {
  1: { start: '08:00', end: '09:40' },
  2: { start: '09:50', end: '11:30' },
  3: { start: '12:20', end: '14:00' },
  4: { start: '14:10', end: '15:50' },
  5: { start: '16:00', end: '17:40' },
  6: { start: '18:05', end: '19:45' },
  7: { start: '19:50', end: '21:30' },
};

export type Lesson = {
  subjectId: SubjectId;
  /** 1 = понедельник … 7 = воскресенье */
  weekday: number;
  slot: number;
  room: string;
  kind: LessonKind;
  /** На какой из чередующихся недель идёт пара. */
  weeks: WeekType | 'both';
};

export const LESSONS: Lesson[] = [
  // ── Вторник ────────────────────────────────────────────────────────
  { subjectId: 'en', weekday: 2, slot: 2, room: '509', kind: 'practice', weeks: 'both' },
  { subjectId: 'oep', weekday: 2, slot: 3, room: '26', kind: 'lecture', weeks: 'lectures' },
  { subjectId: 'oep', weekday: 2, slot: 3, room: '207', kind: 'seminar', weeks: 'seminars' },

  // ── Среда ──────────────────────────────────────────────────────────
  { subjectId: 'de', weekday: 3, slot: 2, room: '308', kind: 'practice', weeks: 'both' },
  { subjectId: 'tvms', weekday: 3, slot: 3, room: '26', kind: 'lecture', weeks: 'lectures' },
  { subjectId: 'tvms', weekday: 3, slot: 3, room: '26', kind: 'seminar', weeks: 'seminars' },

  // ── Четверг ────────────────────────────────────────────────────────
  { subjectId: 'en', weekday: 4, slot: 1, room: '509', kind: 'practice', weeks: 'both' },
  { subjectId: 'vmnir', weekday: 4, slot: 4, room: '26', kind: 'lecture', weeks: 'lectures' },
  { subjectId: 'vmnir', weekday: 4, slot: 4, room: '26', kind: 'seminar', weeks: 'seminars' },

  // ── Пятница ────────────────────────────────────────────────────────
  { subjectId: 'de', weekday: 5, slot: 2, room: '305', kind: 'practice', weeks: 'both' },
  { subjectId: 'to1', weekday: 5, slot: 3, room: '26', kind: 'lecture', weeks: 'lectures' },
  { subjectId: 'to1', weekday: 5, slot: 3, room: '26', kind: 'seminar', weeks: 'seminars' },
];

/** Понедельник недели-якоря и её тип. От этого считается чередование. */
export const ANCHOR_MONDAY = '2026-08-31';
export const ANCHOR_WEEK_TYPE: WeekType = 'lectures';

export const LESSON_KIND_LABEL: Record<LessonKind, string> = {
  lecture: 'Лекция',
  seminar: 'Семинар',
  practice: 'Практика',
};

export const WEEK_TYPE_LABEL: Record<WeekType, string> = {
  lectures: 'Лекционная неделя',
  seminars: 'Семинарская неделя',
};
