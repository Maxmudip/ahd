/** Uzbek date/time labels for timestamps coming from the database. Always evaluated on the client. */

const SHORT_MONTHS = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sent", "okt", "noy", "dek"];
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Whole calendar days between `date` and `now` (0 = today, 1 = yesterday). */
function calendarDaysAgo(date: Date, now: Date) {
  return Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);
}

export function clock(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** "Bugun" | "Kecha" | "12-sent" (| "12-sent 2025" for other years). */
export function dayLabel(date: Date, now = new Date()) {
  const ago = calendarDaysAgo(date, now);
  if (ago <= 0) return "Bugun";
  if (ago === 1) return "Kecha";
  const base = `${date.getDate()}-${SHORT_MONTHS[date.getMonth()]}`;
  return date.getFullYear() === now.getFullYear() ? base : `${base} ${date.getFullYear()}`;
}

/** "Bugun, 14:22" — the format the chat list understands (see `listTime`). */
export function stampLabel(date: Date, now = new Date()) {
  return `${dayLabel(date, now)}, ${clock(date)}`;
}

/** "Hozir" | "5 daqiqa oldin" | "2 soat oldin" | "Kecha" | "4 kun oldin" | "2 oy oldin". */
export function relativeLabel(date: Date, now = new Date()) {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return "Hozir";
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const ago = calendarDaysAgo(date, now);
  if (ago <= 0) return `${Math.floor(minutes / 60)} soat oldin`;
  if (ago === 1) return "Kecha";
  if (ago < 30) return `${ago} kun oldin`;
  return `${Math.max(1, Math.floor(ago / 30))} oy oldin`;
}

/** Whole days from now until `date` (never negative). */
export function daysUntil(date: Date, now = new Date()) {
  return Math.max(0, Math.ceil((date.getTime() - now.getTime()) / DAY_MS));
}
