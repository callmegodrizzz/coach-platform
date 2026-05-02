'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Редирект в зависимости от роли
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center py-16">
      <Container className="max-w-md">
        <Link href="/" className="font-display text-xl tracking-tight block mb-12">
          ← MATERIUM
        </Link>

        <h1 className="font-display-uppercase text-5xl mb-4">Вход</h1>
        <p className="text-ink/60 mb-12">
          Войдите в личный кабинет
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 rounded-2xl border border-ink/20 bg-transparent focus:border-ink focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-4 rounded-2xl border border-ink/20 bg-transparent focus:border-ink focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="px-5 py-4 rounded-2xl bg-accent/10 text-accent text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-ink/60">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-accent hover:underline font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </Container>
    </main>
  );
}
