'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '../../../../hooks/useRequireAuth';
import { api } from '../../../../lib/api';
import LoadingScreen from '../../../../components/ui/LoadingScreen';
import Container from '../../../../components/ui/Container';
import Button from '../../../../components/ui/Button';

export default function LessonPage() {
  const { id } = useParams();
  const { user, loading } = useRequireAuth();
  const [lesson, setLesson] = useState(null);
  const [myProgress, setMyProgress] = useState(null);
  const [myAssignments, setMyAssignments] = useState([]);
  const [assignmentContent, setAssignmentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    async function loadData() {
      try {
        const [lessonData, progressData, assignmentsData] = await Promise.all([
          api.getLesson(id),
          api.myProgress(),
          api.myAssignments(),
        ]);
        setLesson(lessonData.lesson);
        setMyProgress(progressData.progress.find((p) => p.lessonId === id) || null);
        setMyAssignments(assignmentsData.assignments.filter((a) => a.lessonId === id));
      } catch (err) {
        console.error('Failed to load lesson:', err);
      } finally {
        setDataLoading(false);
      }
    }

    loadData();
  }, [user, id]);

  async function handleMarkCompleted() {
    setMarking(true);
    try {
      await api.markCompleted(id);
      setMyProgress({ completed: true, completedAt: new Date() });
      setMessage('Урок отмечен как пройденный!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setMarking(false);
    }
  }

  async function handleSubmitAssignment(e) {
    e.preventDefault();
    if (!assignmentContent.trim()) return;
    setSubmitting(true);
    try {
      const data = await api.submitAssignment(id, assignmentContent);
      setMyAssignments([...myAssignments, data.assignment]);
      setAssignmentContent('');
      setMessage('Домашнее задание отправлено на проверку!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || dataLoading) return <LoadingScreen />;
  if (!lesson) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <p className="text-ink/60 mb-4">Урок не найден</p>
        <Link href="/dashboard" className="text-accent hover:underline">Вернуться</Link>
      </div>
    </div>
  );

  const isCompleted = myProgress?.completed;
  const latestAssignment = myAssignments[myAssignments.length - 1];

  return (
    <main className="min-h-screen bg-cream">
      <header className="border-b border-ink/10 px-8 py-6 flex justify-between items-center">
        <Link href="/" className="font-display text-xl tracking-tight">MATERIUM</Link>
        <Link href="/dashboard" className="text-sm text-ink/60 hover:text-accent transition-colors">
          ← Кабинет
        </Link>
      </header>

      <Container className="py-16 max-w-4xl">
        {/* Хлебные крошки */}
        <div className="flex items-center gap-2 text-sm text-ink/40 mb-8">
          <Link href="/dashboard" className="hover:text-accent">Программа</Link>
          <span>/</span>
          <span>{lesson.module?.title}</span>
          <span>/</span>
          <span className="text-ink">{lesson.title}</span>
        </div>

        {/* Заголовок */}
        <div className="mb-12">
          <h1 className="font-display-uppercase text-4xl md:text-6xl mb-4">{lesson.title}</h1>
          {isCompleted && (
            <span className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-accent/10 text-accent font-medium">
              ✓ Урок пройден
            </span>
          )}
        </div>

        {/* Видео */}
        {lesson.videoUrl && (
          <div className="mb-12 aspect-video rounded-3xl overflow-hidden bg-ink">
            <iframe
              src={lesson.videoUrl.replace('watch?v=', 'embed/')}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}

        {/* Контент */}
        {lesson.content && (
          <div className="mb-12 p-8 bg-white/60 rounded-3xl border border-ink/10">
            <h2 className="font-display text-2xl mb-4">Материал урока</h2>
            <p className="text-base leading-relaxed text-ink/80 whitespace-pre-wrap">
              {lesson.content}
            </p>
          </div>
        )}

        {/* Кнопка "Отметить пройденным" */}
        {!isCompleted && (
          <div className="mb-12">
            <Button
              variant="primary"
              onClick={handleMarkCompleted}
              disabled={marking}
            >
              {marking ? 'Сохраняем...' : 'Отметить урок пройденным'}
            </Button>
          </div>
        )}

        {/* Домашнее задание */}
        <div className="mb-8">
          <h2 className="font-display-uppercase text-3xl mb-6">Домашнее задание</h2>

          {/* Уже сданные */}
          {myAssignments.length > 0 && (
            <div className="space-y-4 mb-8">
              {myAssignments.map((assignment) => (
                <div key={assignment.id} className="p-6 rounded-2xl border border-ink/10 bg-white/60">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-ink/40">
                      {new Date(assignment.submittedAt).toLocaleDateString('ru-RU')}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      assignment.status === 'APPROVED'
                        ? 'bg-accent/10 text-accent'
                        : assignment.status === 'REJECTED'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-ink/10 text-ink/60'
                    }`}>
                      {assignment.status === 'APPROVED' ? 'Одобрено'
                        : assignment.status === 'REJECTED' ? 'На доработку'
                        : 'На проверке'}
                    </span>
                  </div>
                  <p className="text-sm text-ink/80 mb-3">{assignment.content}</p>
                  {assignment.feedback && (
                    <div className="mt-3 pt-3 border-t border-ink/10">
                      <p className="text-xs text-ink/40 mb-1">Фидбек куратора:</p>
                      <p className="text-sm text-accent">{assignment.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Форма сдачи */}
          {(!latestAssignment || latestAssignment.status === 'REJECTED') && (
            <form onSubmit={handleSubmitAssignment}>
              <textarea
                value={assignmentContent}
                onChange={(e) => setAssignmentContent(e.target.value)}
                placeholder="Напишите ваш ответ на задание..."
                rows={6}
                className="w-full px-5 py-4 rounded-2xl border border-ink/20 bg-transparent focus:border-ink focus:outline-none transition-colors resize-none mb-4"
              />
              <Button type="submit" variant="outline" disabled={submitting}>
                {submitting ? 'Отправляем...' : 'Сдать задание'}
              </Button>
            </form>
          )}
        </div>

        {/* Сообщение */}
        {message && (
          <div className="p-4 rounded-2xl bg-accent/10 text-accent text-sm">
            {message}
          </div>
        )}
      </Container>
    </main>
  );
}
