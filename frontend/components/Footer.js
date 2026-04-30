import Container from './ui/Container';

export default function Footer() {
  return (
    <footer className="bg-ink text-cream py-16 border-t border-cream/10">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="font-display text-2xl mb-2">MATERIUM</div>
            <p className="text-sm text-cream/60">
              Лаборатория лидеров будущего
            </p>
          </div>

          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-accent transition-colors">Telegram</a>
            <a href="#" className="hover:text-accent transition-colors">Instagram</a>
            <a href="#" className="hover:text-accent transition-colors">Контакты</a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/10 text-xs text-cream/40">
          © 2026 MATERIUM. Все права защищены.
        </div>
      </Container>
    </footer>
  );
}
