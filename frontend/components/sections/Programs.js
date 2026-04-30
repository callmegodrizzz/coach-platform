import Container from '../ui/Container';

const programs = [
  {
    title: 'Программа «Культурный код» (Skolkovo, 2021–2024)',
    icon: '⭐',
  },
  {
    title: 'Лаборатория лидеров будущего MATERIUM в Алтае (2024, 2025)',
    description: 'Образовательная экспедиция, объединившая предпринимателей, философов и художников',
    icon: '⭐',
  },
  {
    title: 'Женское комьюнити «Компаньонка» (2022—2024 г.)',
    description: 'Международное женское коммьюнити визионеров и креативного лидерства',
    icon: '⭐',
  },
  {
    title: 'Образовательная программа «Подарочек» (2025 г.)',
    description: 'Программа по креативному продюсированию',
    icon: '⭐',
  },
];

export default function Programs() {
  return (
    <section className="bg-ink text-cream py-32">
      <Container>
        <h2 className="font-display-uppercase text-[10vw] md:text-[6vw] leading-[0.9] mb-20 text-accent">
          Образование<br />и трансформация
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Линия таймлайна */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-[1px] bg-accent/40 z-0" />

          {programs.map((program, idx) => (
            <div key={idx} className="relative z-10">
              <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mb-6 mx-auto lg:mx-0">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-3xl">
                  {program.icon}
                </div>
              </div>
              <h3 className="font-display-uppercase text-base md:text-lg mb-3 leading-tight">
                {program.title}
              </h3>
              {program.description && (
                <p className="text-sm text-cream/70 leading-relaxed">
                  {program.description}
                </p>
              )}
              <a href="#" className="text-accent text-sm mt-4 inline-block hover:underline">
                Узнать подробнее
              </a>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
