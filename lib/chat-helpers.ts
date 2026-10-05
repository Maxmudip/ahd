export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (
    words
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** "Bugun, 14:22" -> "14:22", "Kecha, 19:10" -> "Kecha", "12-sent, 11:00" -> "12-sent". */
export function listTime(updatedAt: string) {
  const [day, clock] = updatedAt.split(", ");
  if (day === "Bugun" && clock) return clock;
  return day;
}

/** Day of the seeded conversation, used as the default day for messages without `day`. */
export function dayOfStamp(updatedAt: string | undefined) {
  if (!updatedAt) return "Bugun";
  return updatedAt.split(", ")[0];
}

const HOURLY = /soat|daqiqa|hozir|bugun/i;

export function isHourly(time: string) {
  return HOURLY.test(time);
}

/** Pool activity only has relative stamps; fold hour-level stamps into "Bugun". */
export function dayLabelFromRelative(time: string) {
  return isHourly(time) ? "Bugun" : time;
}

/**
 * Ids created in this browser session, with their creation time. It is only ever filled from event
 * handlers, so it is always empty during SSR and the first client render (no hydration mismatch).
 */
const freshAt = new Map<string, number>();

export function markFresh(id: string) {
  freshAt.set(id, Date.now());
  return id;
}

/** True for ids created moments ago in this session (used to animate new bubbles only). */
export function isFreshId(id: string) {
  const created = freshAt.get(id);
  return created !== undefined && Date.now() - created < 2000;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const NAME_COLORS = ["#8A6B2E", "#5A6B38", "#8F5430", "#35505F", "#6A3A4C", "#4A463E"];

export function nameColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return NAME_COLORS[hash % NAME_COLORS.length];
}

/** RFC 4122 v4 id. `crypto.randomUUID` only exists on secure origins, so fall back for http://<lan-ip>. */
export function uuid(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === "function") c.getRandomValues(bytes);
  else for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

/** Database-ready id (uuid) created from an event handler; flagged fresh for bubble animations. */
export function freshId(): string {
  return markFresh(uuid());
}
