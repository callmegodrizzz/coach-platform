'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { api } from '../../../lib/api';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import Container from '../../../components/ui/Container';

export default function AdminModulesPage() {
  const { user, loading } = useRequireAuth('ADMIN');
  const [modules, setModules] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(null);
  const [message, setMessage] = useState('');

  const [moduleForm, setModuleForm] = useState({ title: '', description: '', order: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', videoUrl: '', order: '' });

  useEffect(() => {
    if (!user) return;
    loadModules();
  }, [user]);

  async function loadModules() {
    try {
      const data = await api.getModules();
      setModules(data.modules);
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  }

  async function handleCreateModule(e) {
    e.preventDefault();
    try {
      await api.createModule({
        title: moduleForm.title,
        description: moduleForm.description,
        order: parseInt(moduleForm.order),
      });
      setModuleForm({ title: '', description: '', order: '' });
      setShowModuleForm(false);
      setMessage('Модуль создан!');
      setTimeout(() => setMessage(''), 3000);
      loadModules();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleCreateLesson(e, moduleId) {
    e.preventDefault();
    try {
      await api.createLesson({
        moduleId,
        title: lessonForm.title,
        content: lessonForm.content,
        videoUrl: lessonForm.videoUrl || null,
        order: parseInt(lessonForm.order),
      });
      setLessonForm({ title: '', content: '', videoUrl: '', order: '' });
      setShowLessonForm(null);
      setMessage('Урок создан!');
      setTimeout(() => setMessage(''), 3000);
      loadModules();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleDeleteModule(id) {
    if (!confirm('Удалить модуль и все его уроки?')) return;
    try {
      await api.deleteModule(id);
      setModules(modules.filter((m) => m.id !== id));
      setMessage('Модуль удалён');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (loading || dataLoading) return <LoadingScreen />;

  const inputClass = "w-full px-4 py-3 rounded-xl bg-cream/10 border border-cream/20 text-cream placeholder-cream/30 focus:outline-none focus:border-cream/40 text-sm";

  return (
    <main className="min-h-screen bg-ink text-cream">
      <header className="border-b border-cream/10 px-8 py-6 flex justify-between items-center">
        <Link href="/" className="font-display text-xl tracking-tight">MATERIUM</Link>
        <Link href="/admin" className="text-sm text-cream/60 hover:text-accent transition-colors">
          ← Панель
        </Link>
      </header>

      <Container className="py-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="font-display-uppercase text-5xl md:text-6xl">Программа</h1>
          <button
            onClick={() => setShowModuleForm(!showModuleForm)}
            className="px-6 py-3 rounded-full bg-accent text-cream text-sm font-semibold hover:bg-accent/80 transition-colors"
          >
            + Новый модуль
          </button>
        </div>

        {message && (
          <div className="mb-6 px-5 py-4 rounded-2xl bg-accent/20 text-accent text-sm">
            {message}
          </div>
        )}

        {/* Форма создания модуля */}
        {showModuleForm && (
          <form onSubmit={handleCreateModule} className="bg-cream/5 rounded-3xl p-8 mb-8 space-y-4">
            <h3 className="font-display text-xl mb-4">Новый модуль</h3>
            <input
              value={moduleForm.title}
              onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
              placeholder="Название модуля"
              required
              className={inputClass}
            />
            <input
              value={moduleForm.description}
              onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
              placeholder="Описание (необязательно)"
              className={inputClass}
            />
            <input
              type="number"
              value={moduleForm.order}
              onChange={(e) => setModuleForm({ ...moduleForm, order: e.target.value })}
              placeholder="Порядковый номер (1, 2, 3...)"
              required
              className={inputClass}
            />
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-3 rounded-full bg-accent text-cream text-sm font-semibold">
                Создать модуль
              </button>
              <button
                type="button"
                onClick={() => setShowModuleForm(false)}
                className="px-6 py-3 rounded-full bg-cream/10 text-cream/60 text-sm"
              >
                Отмена
              </button>
            </div>
          </form>
        )}

        {/* Список модулей */}
        <div className="space-y-6">
          {modules.map((module, idx) => (
            <div key={module.id} className="bg-cream/5 rounded-3xl p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-cream/40 uppercase tracking-wider">Модуль {idx + 1}</span>
                  <h3 className="font-display text-2xl mt-1">{module.title}</h3>
                  {module.description && (
                    <p className="text-sm text-cream/60 mt-1">{module.description}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLessonForm(showLessonForm === module.id ? null : module.id)}
                    className="px-4 py-2 rounded-full border border-cream/20 text-cream/60 text-xs hover:border-accent hover:text-accent transition-all"
                  >
                    + Урок
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="px-4 py-2 rounded-full border border-red-500/20 text-red-400/60 text-xs hover:border-red-500/40 hover:text-red-400 transition-all"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              {/* Уроки */}
              {module.lessons.length > 0 && (
                <div className="space-y-2 mb-4">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between px-4 py-3 bg-cream/5 rounded-xl">
                      <span className="text-sm">{lesson.order}. {lesson.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {module.lessons.length === 0 && (
                <p className="text-sm text-cream/30 mb-4">Уроков пока нет</p>
              )}

              {/* Форма добавления урока */}
              {showLessonForm === module.id && (
                <form
                  onSubmit={(e) => handleCreateLesson(e, module.id)}
                  className="bg-cream/5 rounded-2xl p-6 mt-4 space-y-3"
                >
                  <h4 className="font-semibold text-sm mb-2">Новый урок</h4>
                  <input
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="Название урока"
                    required
                    className={inputClass}
                  />
                  <textarea
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    placeholder="Текст урока"
                    rows={4}
                    className={inputClass + ' resize-none'}
                  />
                  <input
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    placeholder="YouTube URL (необязательно)"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })}
                    placeholder="Порядковый номер"
                    required
                    className={inputClass}
                  />
                  <div className="flex gap-3">
                    <button type="submit" className="px-6 py-3 rounded-full bg-accent text-cream text-sm font-semibold">
                      Создать урок
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLessonForm(null)}
                      className="px-6 py-3 rounded-full bg-cream/10 text-cream/60 text-sm"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
