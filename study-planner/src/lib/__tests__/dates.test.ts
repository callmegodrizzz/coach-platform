import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addDays,
  diffDays,
  formatDeadline,
  lessonChipLabel,
  lessonsOn,
  mondayOf,
  nextLessonsFor,
  plural,
  weekTypeOf,
} from '@/lib/dates';

afterEach(() => {
  vi.useRealTimers();
});

/** Фиксируем «сегодня», иначе тесты плывут вместе с календарём. */
function freeze(iso: string, time = '07:00') {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${iso}T${time}:00`));
}

describe('чередование недель', () => {
  it('неделя-якорь лекционная', () => {
    expect(weekTypeOf('2026-08-31')).toBe('lectures');
    expect(weekTypeOf('2026-09-04')).toBe('lectures');
  });

  it('чередуется вперёд', () => {
    expect(weekTypeOf('2026-09-07')).toBe('seminars');
    expect(weekTypeOf('2026-09-14')).toBe('lectures');
    expect(weekTypeOf('2026-09-21')).toBe('seminars');
    expect(weekTypeOf('2026-09-28')).toBe('lectures');
  });

  it('чередуется назад, до недели-якоря', () => {
    expect(weekTypeOf('2026-08-24')).toBe('seminars');
    expect(weekTypeOf('2026-08-17')).toBe('lectures');
  });

  it('не сбивается через полгода', () => {
    // 26 недель после якоря — снова лекционная.
    expect(weekTypeOf(addDays('2026-08-31', 26 * 7))).toBe('lectures');
    expect(weekTypeOf(addDays('2026-08-31', 27 * 7))).toBe('seminars');
  });
});

describe('понедельники', () => {
  it('7 сентября: немецкий и ТО1', () => {
    const l = lessonsOn('2026-09-07');
    expect(l.map((x) => [x.subjectId, x.slot])).toEqual([
      ['de', 1],
      ['to1', 3],
    ]);
    expect(l[1].kind).toBe('seminar');
  });

  it('14 сентября: только немецкий', () => {
    expect(lessonsOn('2026-09-14').map((x) => x.subjectId)).toEqual(['de']);
  });

  it('21 сентября: снова немецкий и ТО1', () => {
    expect(lessonsOn('2026-09-21').map((x) => x.subjectId)).toEqual(['de', 'to1']);
  });

  it('28 сентября: только немецкий', () => {
    expect(lessonsOn('2026-09-28').map((x) => x.subjectId)).toEqual(['de']);
  });
});

describe('остальные дни', () => {
  it('вторник на лекционной неделе: английский и лекция ОЭП в 26-й', () => {
    const l = lessonsOn('2026-09-01');
    expect(l.map((x) => x.subjectId)).toEqual(['en', 'oep']);
    expect(l[1].kind).toBe('lecture');
    expect(l[1].room).toBe('26');
  });

  it('вторник на семинарской неделе: у ОЭП другая аудитория', () => {
    const l = lessonsOn('2026-09-08');
    expect(l[1].kind).toBe('seminar');
    expect(l[1].room).toBe('207');
  });

  it('ТО1 в пятницу только на лекционной неделе', () => {
    expect(lessonsOn('2026-09-04').map((x) => x.subjectId)).toEqual(['de', 'to1']);
    expect(lessonsOn('2026-09-11').map((x) => x.subjectId)).toEqual(['de']);
  });

  it('выходные пустые', () => {
    expect(lessonsOn('2026-09-05')).toHaveLength(0);
    expect(lessonsOn('2026-09-06')).toHaveLength(0);
  });

  it('пары идут по возрастанию времени', () => {
    const slots = lessonsOn('2026-09-07').map((l) => l.slot);
    expect(slots).toEqual([...slots].sort((a, b) => a - b));
  });
});

describe('арифметика дат', () => {
  it('переживает переход на зимнее время', () => {
    // В Европе часы переводят в ночь на 25 октября 2026.
    expect(diffDays('2026-10-26', '2026-10-24')).toBe(2);
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26');
  });

  it('переживает смену года', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(diffDays('2027-01-01', '2026-12-31')).toBe(1);
  });

  it('понедельник недели считается от любого дня', () => {
    expect(mondayOf('2026-09-07')).toBe('2026-09-07');
    expect(mondayOf('2026-09-13')).toBe('2026-09-07');
  });
});

describe('дедлайны по парам', () => {
  it('возвращает пять ближайших пар по предмету, по возрастанию', () => {
    freeze('2026-09-07');
    const dates = nextLessonsFor('to1', 5).map((x) => x.date);
    expect(dates).toHaveLength(5);
    expect([...dates].sort()).toEqual(dates);
    expect(new Set(dates).size).toBe(5);
  });

  it('ТО1 чередует понедельник и пятницу', () => {
    freeze('2026-09-07');
    // Пн 07.09 (семинар) → пт 18.09 (лекция) → пн 21.09 (семинар) → пт 02.10.
    // Пятница семинарской недели и понедельник лекционной пропускаются.
    expect(nextLessonsFor('to1', 4).map((x) => x.date)).toEqual([
      '2026-09-07',
      '2026-09-18',
      '2026-09-21',
      '2026-10-02',
    ]);
  });

  it('сегодняшняя пара считается, пока не началась', () => {
    freeze('2026-09-07', '06:00');
    expect(nextLessonsFor('de', 1)[0].date).toBe('2026-09-07');
  });

  it('и перестаёт считаться после начала', () => {
    freeze('2026-09-07', '08:30');
    expect(nextLessonsFor('de', 1)[0].date).not.toBe('2026-09-07');
  });

  it('подписи чипов', () => {
    expect(lessonChipLabel(0, '2026-09-09')).toBe('След. пара, ср 9');
    expect(lessonChipLabel(1, '2026-09-11')).toBe('Через пару, пт 11');
    expect(lessonChipLabel(2, '2026-09-16')).toBe('Ср 16');
  });
});

describe('текст', () => {
  it('склоняет дни', () => {
    expect(plural(1, 'день', 'дня', 'дней')).toBe('1 день');
    expect(plural(2, 'день', 'дня', 'дней')).toBe('2 дня');
    expect(plural(5, 'день', 'дня', 'дней')).toBe('5 дней');
    expect(plural(11, 'день', 'дня', 'дней')).toBe('11 дней');
    expect(plural(21, 'день', 'дня', 'дней')).toBe('21 день');
  });

  it('описывает дедлайн словами', () => {
    freeze('2026-09-07');
    expect(formatDeadline('2026-09-07')).toBe('Сегодня');
    expect(formatDeadline('2026-09-08')).toBe('Завтра');
    expect(formatDeadline('2026-09-06')).toBe('Вчера');
    expect(formatDeadline('2026-09-04')).toBe('Просрочено на 3 дня');
    expect(formatDeadline('2026-09-10')).toBe('Чт, через 3 дня');
    expect(formatDeadline('2026-10-01')).toBe('1 октября');
  });
});
