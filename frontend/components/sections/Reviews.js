import Container from '../ui/Container';

const reviews = [
  {
    name: 'Пётр Иванов',
    role: 'Девелопер, основатель компании по автомобилестроению «VISUVA»',
    text: 'Творческая часть начинает раскрываться еще больше и проект начинает лететь еще круче',
  },
  {
    name: 'Нелли Грант',
    role: 'Основатель брендов «Soul nails», «Monami professional»',
    text: 'В креативном пространстве здесь — чёткая методология. Такого я не видела нигде.',
  },
  {
    name: 'Александр Прокудин',
    role: 'Девелопер и предприниматель',
    text: 'Плотный метод без лишнего. Картина мира расширилась, части сложились в целое.',
  },
];

export default function Reviews() {
  return (
    <section className="bg-ink text-cream py-32">
      <Container>
        <h2 className="font-display-uppercase text-[10vw] md:text-[6vw] leading-[0.9] mb-20">
          Отзывы учеников<br />о методе MATERIUM
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-cream text-ink rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-ink/10" />
                <div>
                  <h4 className="font-semibold text-accent">{review.name}</h4>
                  <p className="text-xs text-ink/60 leading-tight mt-1">{review.role}</p>
                </div>
              </div>
              <p className="text-base leading-relaxed">«{review.text}»</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
