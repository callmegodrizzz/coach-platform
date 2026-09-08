/**
 * Дизайн-система приложения.
 *
 * Направление: дружелюбный, «чанковый» интерфейс в духе Duolingo / Додо Пиццы —
 * округлый шрифт, насыщенные цвета, толстые кнопки с нижней «подложкой»,
 * пружинные анимации. Никаких тонких линий и серого минимализма.
 */

export const palette = {
  green: '#58CC02',
  greenDark: '#46A302',
  greenSoft: '#E8F8D8',

  red: '#FF4D4F',
  redDark: '#D9363E',
  redSoft: '#FFE9E9',

  amber: '#FFB300',
  amberDark: '#D99000',
};

/** Цвета предметов взяты из твоего расписания, чтобы узнавание было мгновенным. */
export const subjectPalette = {
  red: { base: '#FF4D4F', dark: '#D9363E', soft: '#FFE7E7', softDark: '#3A1F21' },
  amber: { base: '#FFB300', dark: '#D99000', soft: '#FFF3D6', softDark: '#3A2E14' },
  violet: { base: '#7A5AF8', dark: '#5E3FD6', soft: '#EDE8FF', softDark: '#241E3D' },
  slate: { base: '#5B6B7C', dark: '#44515E', soft: '#E8EDF2', softDark: '#1E252B' },
  pink: { base: '#EC4899', dark: '#C42B7A', soft: '#FDE7F2', softDark: '#39182A' },
  cyan: { base: '#06B6D4', dark: '#0490A8', soft: '#DDF6FA', softDark: '#12313A' },
} as const;

export type SubjectColorName = keyof typeof subjectPalette;

const light = {
  bg: '#FFFFFF',
  surface: '#F5F6F8',
  surfaceAlt: '#EBEDF1',
  card: '#FFFFFF',
  cardShadow: 'rgba(15, 17, 21, 0.10)',
  text: '#0F1115',
  textMuted: '#6B7280',
  textFaint: '#A1A8B3',
  border: '#E4E7EC',
  borderStrong: '#D3D8E0',
  onAccent: '#FFFFFF',
  overlay: 'rgba(15, 17, 21, 0.35)',
};

const dark = {
  bg: '#0E1013',
  surface: '#171A1F',
  surfaceAlt: '#1F242B',
  card: '#171A1F',
  cardShadow: 'rgba(0, 0, 0, 0.5)',
  text: '#F4F6FA',
  textMuted: '#9AA4B2',
  textFaint: '#6B7480',
  border: '#262C34',
  borderStrong: '#333B45',
  onAccent: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.55)',
};

export const schemes = { light, dark };
export type ColorScheme = typeof light;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

/** Толщина «подложки» у чанковых элементов — фирменный приём Duolingo. */
export const chunk = 4;

export const font = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
} as const;

export const type = {
  display: { fontFamily: font.extrabold, fontSize: 32, lineHeight: 38 },
  title: { fontFamily: font.extrabold, fontSize: 24, lineHeight: 30 },
  heading: { fontFamily: font.bold, fontSize: 19, lineHeight: 25 },
  body: { fontFamily: font.semibold, fontSize: 16, lineHeight: 22 },
  bodyRegular: { fontFamily: font.regular, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: font.bold, fontSize: 14, lineHeight: 19 },
  caption: { fontFamily: font.bold, fontSize: 12, lineHeight: 16 },
  micro: { fontFamily: font.extrabold, fontSize: 11, lineHeight: 14 },
} as const;

/** Единая пружина для всех переходов. Лёгкий overshoot — это «характер» приложения. */
export const spring = {
  damping: 18,
  stiffness: 220,
  mass: 0.7,
} as const;

export const springSoft = {
  damping: 24,
  stiffness: 160,
  mass: 0.8,
} as const;
