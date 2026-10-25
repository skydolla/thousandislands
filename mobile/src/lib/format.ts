const DATE: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

/** Parses a "YYYY-MM-DD" date as local midnight, so it never shifts a day in other time zones. */
export function parseDay(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** The inverse of parseDay. */
export function toDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDateRange(start: string, end: string): string {
  const s = parseDay(start).toLocaleDateString("en-US", DATE);
  if (start === end) return s;
  return `${s} – ${parseDay(end).toLocaleDateString("en-US", DATE)}`;
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
