'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

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
      <div className="font-display text-xl tracking-tight">MATERIUM</div>
      <button className="w-10 h-10 rounded-full bg-ink text-cream text-xs font-semibold hover:bg-accent transition-colors">
        EN
      </button>
    </header>
  );
}
