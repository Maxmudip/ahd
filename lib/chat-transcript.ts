/** Shared by the AI routes: turns untrusted client chat JSON into a bounded plain-text transcript. */
const MAX_MESSAGES = 200;
const MAX_MESSAGE_CHARS = 2000;
const MAX_TOTAL_CHARS = 40_000;

type IncomingMessage = { author?: unknown; text?: unknown; time?: unknown };

/** Returns transcript lines ("Author [12:30]: text"), newest messages kept when the chat is long. */
export function buildTranscript(messages: unknown): string[] {
  if (!Array.isArray(messages)) return [];
  const lines: string[] = [];
  let total = 0;
  for (const raw of (messages as IncomingMessage[]).slice(-MAX_MESSAGES)) {
    if (!raw || typeof raw.text !== "string" || !raw.text.trim()) continue;
    const author = typeof raw.author === "string" && raw.author.trim() ? raw.author.trim().slice(0, 80) : "Noma'lum";
    const time = typeof raw.time === "string" ? ` [${raw.time.slice(0, 20)}]` : "";
    const line = `${author}${time}: ${raw.text.trim().slice(0, MAX_MESSAGE_CHARS)}`;
    total += line.length;
    if (total > MAX_TOTAL_CHARS) break;
    lines.push(line);
  }
  return lines;
}
