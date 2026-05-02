'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { api } from '../../../lib/api';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import Container from '../../../components/ui/Container';
import Button from '../../../components/ui/Button';

export default function AdminAssignmentsPage() {
  const { user, loading } = useRequireAuth('ADMIN');
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [dataLoading, setDataLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    loadAssignments();
  }, [user]);

  async function loadAssignments() {
    try {
      const data = await api.allAssignments();
      setAssignments(data.assignments);
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  }

  async function handleReview(id, status) {
    try {
      await api.reviewAssignment(id, status, feedback);
      setAssignments(assignments.map((a) =>
        a.id === id ? { ...a, status, feedback } : a
      ));
      setReviewing(null);
      setFeedback('');
      setMessage(`Домашка ${status === 'APPROVED' ? 'одобрена' : 'отправлена на доработку'}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (loading || dataLoading) return <LoadingScreen />;

  const filtered = assignments.filter((a) => a.status === filter);

  const statusLabel = {
    PENDING: 'На проверке',
    APPROVED: 'Одобрено',
    REJECTED: 'На доработку',
  };

  return (
    <main className="min-h-screen bg-ink text-cream">
      <header className="border-b border-cream/10 px-8 py-6 flex justify-between items-center">
        <Link href="/" className="font-display text-xl tracking-tight">MATERIUM</Link>
        <Link href="/admin" className="text-sm text-cream/60 hover:text-accent transition-colors">
          ← Панель
        </Link>
      </header>

      <Container className="py-16">
        <h1 className="font-display-uppercase text-5xl md:text-6xl mb-12">
          Домашние задания
        </h1>

        {/* Фильтр */}
        <div className="flex gap-3 mb-10">
          {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                filter === status
                  ? 'bg-accent text-cream'
                  : 'bg-cream/10 text-cream/60 hover:bg-cream/20'
              }`}
            >
              {statusLabel[status]} ({assignments.filter((a) => a.status === status).length})
            </button>
          ))}
        </div>

        {message && (
          <div className="mb-6 px-5 py-4 rounded-2xl bg-accent/20 text-accent text-sm">
            {message}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-cream/40">
            Нет домашек со статусом "{statusLabel[filter]}"
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((assignment) => (
              <div key={assignment.id} className="bg-cream/5 rounded-3xl p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-accent text-lg mb-1">
                      {assignment.user?.name}
                    </h3>
                    <p className="text-sm text-cream/60">
                      {assignment.lesson?.module?.title} → {assignment.lesson?.title}
                    </p>
                    <p className="text-xs text-cream/40 mt-1">
                      {new Date(assignment.submittedAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                    assignment.status === 'APPROVED'
                      ? 'bg-accent/20 text-accent'
                      : assignment.status === 'REJECTED'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-cream/20 text-cream/60'
                  }`}>
                    {statusLabel[assignment.status]}
                  </span>
                </div>

                <div className="bg-cream/5 rounded-2xl p-5 mb-4">
                  <p className="text-sm leading-relaxed text-cream/80">
                    {assignment.content}
                  </p>
                </div>

                {assignment.feedback && (
                  <div className="bg-accent/10 rounded-2xl p-4 mb-4">
                    <p className="text-xs text-cream/40 mb-1">Ваш фидбек:</p>
                    <p className="text-sm text-accent">{assignment.feedback}</p>
                  </div>
                )}

                {assignment.status === 'PENDING' && (
                  <div>
                    {reviewing === assignment.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Фидбек студенту (необязательно)..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-cream/10 border border-cream/20 text-cream placeholder-cream/30 focus:outline-none focus:border-cream/40 resize-none text-sm"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleReview(assignment.id, 'APPROVED')}
                            className="px-6 py-3 rounded-full bg-accent text-cream text-sm font-semibold hover:bg-accent/80 transition-colors"
                          >
                            Одобрить
                          </button>
                          <button
                            onClick={() => handleReview(assignment.id, 'REJECTED')}
                            className="px-6 py-3 rounded-full bg-cream/10 text-cream text-sm font-semibold hover:bg-cream/20 transition-colors"
                          >
                            На доработку
                          </button>
                          <button
                            onClick={() => { setReviewing(null); setFeedback(''); }}
                            className="px-6 py-3 rounded-full text-cream/40 text-sm hover:text-cream/60 transition-colors"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewing(assignment.id)}
                        className="px-6 py-3 rounded-full border border-cream/20 text-cream/60 text-sm font-semibold hover:border-accent hover:text-accent transition-all"
                      >
                        Проверить →
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
