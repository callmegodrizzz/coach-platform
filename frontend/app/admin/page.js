'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { api } from '../../lib/api';
import LoadingScreen from '../../components/ui/LoadingScreen';
import Container from '../../components/ui/Container';

export default function AdminPage() {
  const { user, loading } = useRequireAuth('ADMIN');
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        const [modulesData, assignmentsData] = await Promise.all([
          api.getModules(),
          api.allAssignments(),
        ]);
        setModules(modulesData.modules);
        setAssignments(assignmentsData.assignments);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setDataLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (loading || dataLoading) return <LoadingScreen />;

  const pendingAssignments = assignments.filter((a) => a.status === 'PENDING');
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <main className="min-h-screen bg-ink text-cream">
      <header className="border-b border-cream/10 px-8 py-6 flex justify-between items-center">
        <Link href="/" className="font-display text-xl tracking-tight">MATERIUM</Link>
        <div className="flex items-center gap-6">
          <span className="text-sm text-cream/60">Панель управления</span>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
            className="text-sm text-cream/60 hover:text-accent transition-colors"
          >
            Выйти
          </button>
        </div>
      </header>

      <Container className="py-16">
        <div className="mb-16">
          <h1 className="font-display-uppercase text-5xl md:text-7xl mb-4">
            Панель управления
          </h1>
          <p className="text-cream/60">Добро пожаловать, {user?.name}</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="bg-cream/10 rounded-3xl p-6">
            <div className="font-display text-4xl mb-2 text-accent">{pendingAssignments.length}</div>
            <div className="text-sm text-cream/60">На проверке</div>
          </div>
          <div className="bg-cream/10 rounded-3xl p-6">
            <div className="font-display text-4xl mb-2">{assignments.length}</div>
            <div className="text-sm text-cream/60">Всего домашек</div>
          </div>
          <div className="bg-cream/10 rounded-3xl p-6">
            <div className="font-display text-4xl mb-2">{modules.length}</div>
            <div className="text-sm text-cream/60">Модулей</div>
          </div>
          <div className="bg-cream/10 rounded-3xl p-6">
            <div className="font-display text-4xl mb-2">{totalLessons}</div>
            <div className="text-sm text-cream/60">Уроков</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Домашки на проверке */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display-uppercase text-2xl">На проверке</h2>
              <Link href="/admin/assignments" className="text-accent text-sm hover:underline">
                Все домашки →
              </Link>
            </div>

            {pendingAssignments.length === 0 ? (
              <div className="bg-cream/5 rounded-3xl p-8 text-center text-cream/40">
                Нет домашек на проверке
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.slice(0, 5).map((a) => (
                  <Link
                    key={a.id}
                    href="/admin/assignments"
                    className="block bg-cream/5 hover:bg-cream/10 rounded-2xl p-5 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm text-accent">{a.user?.name}</span>
                      <span className="text-xs text-cream/40">
                        {new Date(a.submittedAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-xs text-cream/60 mb-1">{a.lesson?.title}</p>
                    <p className="text-sm text-cream/80 line-clamp-2">{a.content}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Программа */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display-uppercase text-2xl">Программа</h2>
              <Link href="/admin/modules" className="text-accent text-sm hover:underline">
                Управление →
              </Link>
            </div>

            <div className="space-y-3">
              {modules.map((module, idx) => (
                <div key={module.id} className="bg-cream/5 rounded-2xl p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-cream/40 uppercase tracking-wider">
                        Модуль {idx + 1}
                      </span>
                      <p className="font-semibold mt-1">{module.title}</p>
                    </div>
                    <span className="text-xs text-cream/40">
                      {module.lessons.length} уроков
                    </span>
                  </div>
                </div>
              ))}

              <Link
                href="/admin/modules"
                className="block bg-accent/20 hover:bg-accent/30 rounded-2xl p-5 text-center text-accent font-semibold transition-colors"
              >
                + Добавить модуль
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
