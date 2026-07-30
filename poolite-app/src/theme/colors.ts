// "Acqua di giorno" palette — bright, summery, garden app. Never dark/tech.
// Amber is reserved ONLY for money saved / deals — if it's everywhere, it means nothing.
export const colors = {
  background: '#F2F8FA',
  backgroundGradientTop: '#E7F2F5',
  backgroundGradientBottom: '#F4F9F6',

  primary: '#0E5A6D', // titles, buttons, active tabs
  accent: '#16A0B8', // highlights, water elements, good scores
  amber: '#E8A13C', // euros saved & deals — sacred, use sparingly
  amberSoft: '#F4C171',

  textPrimary: '#12313A',
  textSecondary: '#4E6B74',
  border: '#D7E8EC',
  card: '#FFFFFF',

  error: '#C4553B', // water urgency / errors
  errorBg: '#FBEDEA',
  errorBorder: '#E8C5BC',
  errorText: '#8A3B29',

  selectedBg: '#EAF6F9',
  selectedBorder: '#B9E2EA',

  amberBg: '#FBF3E4',
  amberBorder: '#F0DDB4',
} as const;

export type ColorToken = keyof typeof colors;
