import Container from '../ui/Container';
import Button from '../ui/Button';

export default function Hero() {
  return (
    <section className="bg-cream min-h-screen flex items-center pt-32 pb-24">
      <Container>
        <h1 className="font-display-uppercase text-[12vw] md:text-[8vw] leading-[0.9] mb-20">
          Materium — это инкубатор лидеров будущего
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          <p className="text-base md:text-lg leading-relaxed">
            Здесь рождаются проекты, которые{' '}
            <span className="text-accent font-semibold">живут десятилетиями.</span>
          </p>
          <p className="text-base md:text-lg leading-relaxed">
            Здесь формируется{' '}
            <span className="text-accent font-semibold">мышление, опережающее время.</span>
          </p>
          <p className="text-base md:text-lg leading-relaxed">
            Здесь собираются те, кто{' '}
            <span className="text-accent font-semibold">творит культуру,</span>{' '}
            а не потребляет её.
          </p>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display-uppercase text-2xl md:text-4xl mb-12 leading-tight">
            Если ты чувствуешь, что твоё время пришло — действуй.
          </h2>
          <p className="text-sm text-ink/60 mb-8">
            Мест всегда меньше, чем желающих
          </p>
          <Button variant="outline">Записаться на адмиссию</Button>
        </div>
      </Container>
    </section>
  );
}
