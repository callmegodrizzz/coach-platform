'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { api } from '../../lib/api';
import LoadingScreen from '../../components/ui/LoadingScreen';
import Container from '../../components/ui/Container';

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        const [modulesData, progressData, assignmentsData] = await Promise.all([
          api.getModules(),
          api.myProgress(),
          api.myAssignments(),
        ]);
        setModules(modulesData.modules);
        setProgress(progressData.progress);
        setAssignments(assignmentsData.assignments);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setDataLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (loading || dataLoading) return <LoadingScreen />;

  // Считаем статистику
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = progress.filter((p) => p.completed).length;
  const progressPercent = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;
  const pendingAssignments = assignments.filter((a) => a.status === 'PENDING').length;
  const approvedAssignments = assignments.filter((a) => a.status === 'APPROVED').length;

  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-ink/10 px-8 py-6 flex justify-between items-center">
        <Link href="/" className="font-display text-xl tracking-tight">
          MATERIUM
        </Link>
        <div className="flex items-center gap-6">
          <span className="text-sm text-ink/60">
            {user?.name}
          </span>
          <Link
            href="/api/logout"
            onClick={(e) => {
              e.preventDefault();
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
            className="text-sm text-ink/60 hover:text-accent transition-colors"
          >
            Выйти
          </Link>
        </div>
      </header>

      <Container className="py-16">
        {/* Приветствие */}
        <div className="mb-16">
          <h1 className="font-display-uppercase text-5xl md:text-7xl mb-4">
            Привет, {user?.name}
          </h1>
          <p className="text-ink/60 text-lg">Продолжай своё путешествие</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="bg-ink text-cream rounded-3xl p-6">
            <div className="font-display text-4xl mb-2">{progressPercent}%</div>
            <div className="text-sm text-cream/60">Пройдено</div>
          </div>
          <div className="bg-cream border border-ink/10 rounded-3xl p-6">
            <div className="font-display text-4xl mb-2">{completedLessons}</div>
            <div className="text-sm text-ink/60">Уроков завершено</div>
          </div>
          <div className="bg-cream border border-ink/10 rounded-3xl p-6">
            <div className="font-display text-4xl mb-2">{pendingAssignments}</div>
            <div className="text-sm text-ink/60">На проверке</div>
          </div>
          <div className="bg-accent text-cream rounded-3xl p-6">
            <div className="font-display text-4xl mb-2">{approvedAssignments}</div>
            <div className="text-sm text-cream/80">Одобрено</div>
          </div>
        </div>

        {/* Прогресс-бар */}
        {totalLessons > 0 && (
          <div className="mb-16">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-medium">Общий прогресс программы</span>
              <span className="text-ink/60">{completedLessons} из {totalLessons} уроков</span>
            </div>
            <div className="h-3 bg-ink/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Модули */}
        <div>
          <h2 className="font-display-uppercase text-3xl mb-8">Программа</h2>

          {modules.length === 0 ? (
            <div className="text-center py-24 text-ink/40">
              <p className="text-lg">Программа скоро появится</p>
              <p className="text-sm mt-2">Следите за обновлениями</p>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module, idx) => {
                const moduleLessons = module.lessons || [];
                const completedInModule = progress.filter(
                  (p) => p.completed && moduleLessons.some((l) => l.id === p.lessonId)
                ).length;
                const modulePercent = moduleLessons.length > 0
                  ? Math.round((completedInModule / moduleLessons.length) * 100)
                  : 0;
                const isStarted = completedInModule > 0;
                const isCompleted = moduleLessons.length > 0 && completedInModule === moduleLessons.length;

                return (
                  <div
                    key={module.id}
                    className="bg-white/60 border border-ink/10 rounded-3xl p-8 hover:border-ink/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-semibold text-ink/40 uppercase tracking-wider">
                            Модуль {idx + 1}
                          </span>
                          {isCompleted && (
                            <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">
                              Завершён
                            </span>
                          )}
                          {isStarted && !isCompleted && (
                            <span className="text-xs px-3 py-1 rounded-full bg-ink/10 text-ink/60 font-medium">
                              В процессе
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-2xl mb-1">{module.title}</h3>
                        {module.description && (
                          <p className="text-sm text-ink/60 mb-4">{module.description}</p>
                        )}

                        {/* Уроки */}
                        {moduleLessons.length > 0 && (
                          <div className="space-y-2 mt-4">
                            {moduleLessons.map((lesson) => {
                              const isLessonCompleted = progress.some(
                                (p) => p.lessonId === lesson.id && p.completed
                              );
                              return (
                                <Link
                                  key={lesson.id}
                                  href={`/dashboard/lesson/${lesson.id}`}
                                  className="flex items-center gap-3 py-2 px-4 rounded-xl hover:bg-ink/5 transition-colors group"
                                >
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                    isLessonCompleted
                                      ? 'bg-accent border-accent'
                                      : 'border-ink/30 group-hover:border-ink'
                                  }`}>
                                    {isLessonCompleted && (
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className={`text-sm ${isLessonCompleted ? 'text-ink/40 line-through' : 'text-ink'}`}>
                                    {lesson.title}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-display text-2xl">{modulePercent}%</div>
                        <div className="text-xs text-ink/40">{completedInModule}/{moduleLessons.length}</div>
                      </div>
                    </div>

                    {moduleLessons.length > 0 && (
                      <div className="mt-6 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-500"
                          style={{ width: `${modulePercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
