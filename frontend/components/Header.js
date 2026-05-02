'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center transition-all duration-300 ${
        scrolled ? 'backdrop-blur-md bg-cream/70' : ''
      }`}
    >
      <Link href="/" className="font-display text-xl tracking-tight">
        MATERIUM
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
              className="text-sm font-medium hover:text-accent transition-colors"
            >
              Кабинет
            </Link>
            <button
              onClick={logout}
              className="text-sm text-ink/60 hover:text-accent transition-colors"
            >
              Выйти
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="px-6 py-2 rounded-full border-2 border-ink text-ink text-sm font-semibold hover:bg-ink hover:text-cream transition-all"
          >
            Войти
          </Link>
        )}

        <button className="w-10 h-10 rounded-full bg-ink text-cream text-xs font-semibold hover:bg-accent transition-colors">
          EN
        </button>
      </div>
    </header>
  );
}
