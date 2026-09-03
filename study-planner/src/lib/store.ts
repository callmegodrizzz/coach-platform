/**
 * Хранилище. Приложение персональное, объём данных — десятки записей в неделю,
 * поэтому всё живёт в памяти и сохраняется в AsyncStorage целиком.
 * Никакой БД, никаких миграций, мгновенное чтение, тривиальный экспорт.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SubjectId } from '@/data/schedule';
import { addDays, diffDays, today, type ISODate } from './dates';

export type ItemKind = 'homework' | 'plan';

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type Item = {
  id: string;
  kind: ItemKind;
  title: string;
  notes: string;
  /** Только для домашки. */
  subjectId?: SubjectId;
  /** Когда сдавать. */
  dueAt?: ISODate;
  /** Когда я собираюсь это делать — от этого зависит экран дня. */
  plannedFor?: ISODate;
  done: boolean;
  doneAt?: string;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
};

export type NewItem = {
  kind: ItemKind;
  title: string;
  notes?: string;
  subjectId?: SubjectId;
  dueAt?: ISODate;
  plannedFor?: ISODate;
};

type State = {
  items: Item[];
  hydrated: boolean;
};

type Actions = {
  add: (input: NewItem) => Item;
  update: (id: string, patch: Partial<Omit<Item, 'id' | 'createdAt'>>) => void;
  remove: (id: string) => void;
  toggleDone: (id: string) => void;
  /** Сдвинуть срок на N дней вперёд (свайп «отложить»). */
  postpone: (id: string, days?: number) => void;
  addSubtask: (id: string, title: string) => void;
  toggleSubtask: (id: string, subtaskId: string) => void;
  removeSubtask: (id: string, subtaskId: string) => void;
  replaceAll: (items: Item[]) => void;
};

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      add: (input) => {
        const now = new Date().toISOString();
        const item: Item = {
          id: uid(),
          kind: input.kind,
          title: input.title.trim(),
          notes: input.notes ?? '',
          subjectId: input.kind === 'homework' ? input.subjectId : undefined,
          dueAt: input.dueAt,
          plannedFor: input.plannedFor,
          done: false,
          subtasks: [],
          createdAt: now,
          updatedAt: now,
        };
        set({ items: [item, ...get().items] });
        return item;
      },

      update: (id, patch) =>
        set({
          items: get().items.map((it) =>
            it.id === id ? { ...it, ...patch, updatedAt: new Date().toISOString() } : it,
          ),
        }),

      remove: (id) => set({ items: get().items.filter((it) => it.id !== id) }),

      toggleDone: (id) =>
        set({
          items: get().items.map((it) => {
            if (it.id !== id) return it;
            const done = !it.done;
            return {
              ...it,
              done,
              doneAt: done ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString(),
            };
          }),
        }),

      postpone: (id, days = 1) =>
        set({
          items: get().items.map((it) => {
            if (it.id !== id) return it;
            const base = it.plannedFor ?? it.dueAt ?? today();
            // Если срок уже в прошлом, «отложить» = перенести на сегодня + N.
            const from = diffDays(base, today()) < 0 ? today() : base;
            return { ...it, plannedFor: addDays(from, days), updatedAt: new Date().toISOString() };
          }),
        }),

      addSubtask: (id, title) =>
        set({
          items: get().items.map((it) =>
            it.id === id
              ? {
                  ...it,
                  subtasks: [...it.subtasks, { id: uid(), title: title.trim(), done: false }],
                  updatedAt: new Date().toISOString(),
                }
              : it,
          ),
        }),

      toggleSubtask: (id, subtaskId) =>
        set({
          items: get().items.map((it) =>
            it.id === id
              ? {
                  ...it,
                  subtasks: it.subtasks.map((s) =>
                    s.id === subtaskId ? { ...s, done: !s.done } : s,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : it,
          ),
        }),

      removeSubtask: (id, subtaskId) =>
        set({
          items: get().items.map((it) =>
            it.id === id
              ? {
                  ...it,
                  subtasks: it.subtasks.filter((s) => s.id !== subtaskId),
                  updatedAt: new Date().toISOString(),
                }
              : it,
          ),
        }),

      replaceAll: (items) => set({ items }),
    }),
    {
      name: 'planer-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ items: s.items }) as any,
      onRehydrateStorage: () => (state) => {
        useStore.setState({ hydrated: true });
      },
    },
  ),
);

// ── Выборки ──────────────────────────────────────────────────────────

/** Дата, по которой задача попадает в план дня: план важнее дедлайна. */
export function effectiveDate(it: Item): ISODate | undefined {
  return it.plannedFor ?? it.dueAt;
}

export function isOverdue(it: Item): boolean {
  if (it.done || !it.dueAt) return false;
  return diffDays(it.dueAt, today()) < 0;
}

export function openItems(items: Item[], kind: ItemKind): Item[] {
  return items.filter((it) => it.kind === kind && !it.done);
}

export function homeworkFor(items: Item[], subjectId: SubjectId, includeDone = false): Item[] {
  return items
    .filter((it) => it.kind === 'homework' && it.subjectId === subjectId)
    .filter((it) => includeDone || !it.done)
    .sort(byDeadline);
}

export function byDeadline(a: Item, b: Item): number {
  const da = a.dueAt ?? '9999-12-31';
  const db = b.dueAt ?? '9999-12-31';
  if (da !== db) return da < db ? -1 : 1;
  return a.createdAt < b.createdAt ? -1 : 1;
}

/** Задачи, запланированные на конкретный день. */
export function itemsOn(items: Item[], date: ISODate): Item[] {
  return items.filter((it) => !it.done && effectiveDate(it) === date).sort(byDeadline);
}

export type Bucket = {
  key: string;
  title: string;
  items: Item[];
  tone: 'danger' | 'accent' | 'normal';
};

/** Группировка для экранов «Дедлайны» и «Планы». */
export function bucketize(items: Item[]): Bucket[] {
  const t = today();
  const overdue: Item[] = [];
  const day0: Item[] = [];
  const day1: Item[] = [];
  const week: Item[] = [];
  const later: Item[] = [];
  const noDate: Item[] = [];

  for (const it of items) {
    const date = effectiveDate(it);
    if (!date) {
      noDate.push(it);
      continue;
    }
    const delta = diffDays(date, t);
    if (delta < 0) overdue.push(it);
    else if (delta === 0) day0.push(it);
    else if (delta === 1) day1.push(it);
    else if (delta <= 7) week.push(it);
    else later.push(it);
  }

  return (
    [
      { key: 'overdue', title: 'Просрочено', items: overdue, tone: 'danger' as const },
      { key: 'today', title: 'Сегодня', items: day0, tone: 'accent' as const },
      { key: 'tomorrow', title: 'Завтра', items: day1, tone: 'normal' as const },
      { key: 'week', title: 'На этой неделе', items: week, tone: 'normal' as const },
      { key: 'later', title: 'Позже', items: later, tone: 'normal' as const },
      { key: 'nodate', title: 'Без срока', items: noDate, tone: 'normal' as const },
    ]
      .map((b) => ({ ...b, items: b.items.sort(byDeadline) }))
      .filter((b) => b.items.length > 0)
  );
}
