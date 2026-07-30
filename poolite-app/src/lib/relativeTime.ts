export function formatRelativeItalian(whenISO: string): string {
  const then = new Date(whenISO).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 2) return 'adesso';
  if (diffMin < 60) return `${diffMin} min fa`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 20) return `${diffH} ${diffH === 1 ? 'ora' : 'ore'} fa`;
  const diffDays = Math.round(diffH / 24);
  if (diffDays === 1) return 'ieri';
  if (diffDays < 7) return `${diffDays} giorni fa`;
  const then_ = new Date(whenISO);
  const weekday = new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(then_);
  if (diffDays < 14) return weekday;
  return `${diffDays} giorni fa`;
}
