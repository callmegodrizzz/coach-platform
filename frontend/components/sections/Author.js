import Container from '../ui/Container';
import Button from '../ui/Button';

export default function Author() {
  return (
    <section className="bg-ink text-cream py-32 relative overflow-hidden">
      <Container>
        <h2 className="font-display-uppercase text-5xl md:text-7xl leading-none mb-20">
          Автор лаборатории
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="aspect-[3/4] bg-white/10 rounded-2xl flex items-center justify-center">
            <span className="text-white/30 text-sm">[Фото Марисабель]</span>
          </div>

          <div>
            <h3 className="font-display-uppercase text-5xl md:text-6xl mb-2 text-accent">
              Марисабель
            </h3>
            <p className="font-display-uppercase text-2xl md:text-3xl mb-8 text-white/80">
              Марина Глухова
            </p>

            <a
              href="https://instagram.com/marisabela"
              className="inline-flex items-center gap-2 text-accent mb-8 hover:underline"
            >
              @marisabela
            </a>

            <div className="space-y-4 text-base md:text-lg leading-relaxed mb-8">
              <p>Визионер. Креатор. Автор и создатель лаборатории MATERIUM</p>
            </div>

            <ul className="space-y-4 text-sm md:text-base leading-relaxed mb-12 text-white/80">
              <li>
                Ведущая и креативный продюсер на программе «Культурный код» школы управления SKOLKOVO 2021—2024 г.
              </li>
              <li>
                Создатель международного женского коммьюнити визионеров и креативного лидерства «Компаньонка» 2022—2024 г.
              </li>
              <li>
                Создатель образовательной программы по креативному продюсированию «Подарочек» 2025 г.
              </li>
            </ul>

            <div className="flex gap-4">
              <Button variant="outline-light">Биография</Button>
              <Button variant="outline-light">Манифест</Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}