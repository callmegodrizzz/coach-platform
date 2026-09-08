import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bucketize,
  effectiveDate,
  homeworkFor,
  isOverdue,
  useStore,
  type Item,
} from '@/lib/store';

const NOW = '2026-09-07';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${NOW}T07:00:00`));
  useStore.setState({ items: [] });
});

afterEach(() => {
  vi.useRealTimers();
});

function make(patch: Partial<Item>): Item {
  return {
    id: Math.random().toString(36).slice(2),
    kind: 'homework',
    title: 'задача',
    notes: '',
    done: false,
    subtasks: [],
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...patch,
  };
}

describe('дата, по которой задача попадает в день', () => {
  it('план важнее дедлайна', () => {
    expect(effectiveDate(make({ dueAt: '2026-09-10', plannedFor: '2026-09-08' }))).toBe('2026-09-08');
  });

  it('без плана берётся дедлайн', () => {
    expect(effectiveDate(make({ dueAt: '2026-09-10' }))).toBe('2026-09-10');
  });

  it('без обоих — ничего', () => {
    expect(effectiveDate(make({}))).toBeUndefined();
  });
});

describe('просрочка', () => {
  it('вчерашний дедлайн просрочен', () => {
    expect(isOverdue(make({ dueAt: '2026-09-06' }))).toBe(true);
  });

  it('сегодняшний ещё нет', () => {
    expect(isOverdue(make({ dueAt: NOW }))).toBe(false);
  });

  it('выполненная задача не просрочена, даже если срок прошёл', () => {
    expect(isOverdue(make({ dueAt: '2026-09-01', done: true }))).toBe(false);
  });

  it('без дедлайна просрочки нет', () => {
    expect(isOverdue(make({ plannedFor: '2026-09-01' }))).toBe(false);
  });
});

describe('группировка', () => {
  it('раскладывает по корзинам и не показывает пустые', () => {
    const buckets = bucketize([
      make({ dueAt: '2026-09-05' }),
      make({ dueAt: NOW }),
      make({ dueAt: '2026-09-08' }),
      make({ dueAt: '2026-09-12' }),
      make({ dueAt: '2026-11-01' }),
      make({}),
    ]);
    expect(buckets.map((b) => b.key)).toEqual([
      'overdue',
      'today',
      'tomorrow',
      'week',
      'later',
      'nodate',
    ]);
    expect(buckets.every((b) => b.items.length > 0)).toBe(true);
  });

  it('внутри корзины сортирует по дедлайну', () => {
    const buckets = bucketize([
      make({ dueAt: '2026-09-13', title: 'позже' }),
      make({ dueAt: '2026-09-09', title: 'раньше' }),
    ]);
    expect(buckets[0].items.map((i) => i.title)).toEqual(['раньше', 'позже']);
  });

  it('граница недели: седьмой день ещё в неделе, восьмой уже позже', () => {
    const buckets = bucketize([make({ dueAt: '2026-09-14' }), make({ dueAt: '2026-09-15' })]);
    expect(buckets.map((b) => b.key)).toEqual(['week', 'later']);
  });
});

describe('действия', () => {
  it('добавляет домашку с предметом', () => {
    const item = useStore.getState().add({
      kind: 'homework',
      title: '  Задачи 3.14  ',
      subjectId: 'tvms',
      dueAt: '2026-09-09',
    });
    expect(item.title).toBe('Задачи 3.14');
    expect(useStore.getState().items).toHaveLength(1);
  });

  it('у личной задачи предмета не остаётся', () => {
    const item = useStore.getState().add({
      kind: 'plan',
      title: 'Проездной',
      subjectId: 'tvms',
    });
    expect(item.subjectId).toBeUndefined();
  });

  it('переключает выполнение и проставляет время', () => {
    const { add, toggleDone } = useStore.getState();
    const item = add({ kind: 'homework', title: 'тест' });
    toggleDone(item.id);
    expect(useStore.getState().items[0].done).toBe(true);
    expect(useStore.getState().items[0].doneAt).toBeTruthy();
    toggleDone(item.id);
    expect(useStore.getState().items[0].doneAt).toBeUndefined();
  });

  it('«на завтра» сдвигает от сегодня, а не от просроченной даты', () => {
    const { add, postpone } = useStore.getState();
    const item = add({ kind: 'homework', title: 'старая', dueAt: '2026-08-20' });
    postpone(item.id, 1);
    // Иначе просроченная задача уехала бы в август и снова исчезла из виду.
    expect(useStore.getState().items[0].plannedFor).toBe('2026-09-08');
  });

  it('«на завтра» для будущей задачи сдвигает от её даты', () => {
    const { add, postpone } = useStore.getState();
    const item = add({ kind: 'homework', title: 'будущая', plannedFor: '2026-09-20' });
    postpone(item.id, 1);
    expect(useStore.getState().items[0].plannedFor).toBe('2026-09-21');
  });

  it('шаги добавляются, переключаются и удаляются', () => {
    const { add, addSubtask, toggleSubtask, removeSubtask } = useStore.getState();
    const item = add({ kind: 'homework', title: 'лаба' });
    addSubtask(item.id, 'посчитать');
    const sub = useStore.getState().items[0].subtasks[0];
    expect(sub.title).toBe('посчитать');
    toggleSubtask(item.id, sub.id);
    expect(useStore.getState().items[0].subtasks[0].done).toBe(true);
    removeSubtask(item.id, sub.id);
    expect(useStore.getState().items[0].subtasks).toHaveLength(0);
  });
});

describe('домашка по предмету', () => {
  it('фильтрует по предмету и прячет выполненное', () => {
    useStore.setState({
      items: [
        make({ subjectId: 'tvms', title: 'открытая' }),
        make({ subjectId: 'tvms', title: 'закрытая', done: true }),
        make({ subjectId: 'de', title: 'чужая' }),
        make({ kind: 'plan', title: 'личная' }),
      ],
    });
    const items = useStore.getState().items;
    expect(homeworkFor(items, 'tvms').map((i) => i.title)).toEqual(['открытая']);
    expect(homeworkFor(items, 'tvms', true)).toHaveLength(2);
  });
});
