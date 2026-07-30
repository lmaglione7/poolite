export function formatItalianDayDate(dateISO: string): string {
  const d = new Date(dateISO + 'T12:00:00');
  const formatted = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  return formatted;
}
