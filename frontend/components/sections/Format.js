import Container from '../ui/Container';
import Button from '../ui/Button';

export default function Format() {
  return (
    <section className="bg-ink text-cream py-32 relative">
      <Container>
        <h2 className="font-display-uppercase text-[10vw] md:text-[6vw] leading-[0.9] mb-20 text-center">
          <span className="text-accent">Формат</span> программы лаборатории
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Онлайн */}
          <div className="p-12 rounded-3xl border border-cream/10 bg-cream/[0.02]">
            <div className="inline-block px-8 py-3 rounded-full bg-accent text-cream font-semibold mb-8">
              ОНЛАЙН
            </div>
            <h3 className="font-display text-3xl mb-6">Лето 2026</h3>
            <p className="text-cream/80 mb-6 leading-relaxed">
              <span className="font-semibold text-cream">Основной креативный процесс</span> Международной лаборатории лидеров будущего. Иммерсивно-перформативное образование с режиссерским рисунком
            </p>
            <ul className="space-y-3 text-cream/70">
              <li>• Живые сессии с менторами лаборатории</li>
              <li>• Работа в мини-группах до 10 человек</li>
              <li>• Индивидуальные разборы с кураторами</li>
              <li>• Терапевтические сессии</li>
            </ul>
          </div>

          {/* Оффлайн */}
          <div className="p-12 rounded-3xl border border-cream/10 bg-cream/[0.02]">
            <div className="inline-block px-8 py-3 rounded-full bg-magenta text-cream font-semibold mb-8">
              ОФФЛАЙН
            </div>
            <h3 className="font-display text-3xl mb-6">Осень 2026</h3>
            <p className="text-cream/80 mb-6 leading-relaxed">
              <span className="font-semibold text-cream">Оффлайн международная лаборатория</span> — 5-7 дневная программа, которую проводят преподаватели со всего мира вживую.
            </p>
            <ul className="space-y-3 text-cream/70">
              <li>• Срежиссированный перформативный опыт</li>
              <li>• Погружение в креативную лабораторию</li>
              <li>• Личные разборы от Марисабель</li>
              <li>• Нетворкинг с лидерами будущего</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Button variant="outline-light" size="lg">Записаться на адмиссию</Button>
          <p className="text-sm text-cream/50 mt-6">
            Всего 60 мест — для сохранения камерности, глубины и кутюрного подхода к каждому участнику
          </p>
        </div>
      </Container>
    </section>
  );
}
