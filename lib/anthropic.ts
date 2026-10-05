import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-only Anthropic client factory. The key comes from `process.env.ANTHROPIC_API_KEY`
 * (no NEXT_PUBLIC_ prefix, so it can never be bundled for the browser).
 *
 * Pasted keys often carry surrounding quotes or whitespace, which Anthropic rejects as an invalid key,
 * so they are stripped here.
 */
export function readAnthropicKey(): string | null {
  const key = (process.env.ANTHROPIC_API_KEY ?? "").trim().replace(/^["']|["']$/g, "").trim();
  return key || null;
}

/** Safe-to-log description of a key: never the full value. */
export function describeKey(raw: string | undefined) {
  const value = raw ?? "";
  const key = value.trim().replace(/^["']|["']$/g, "").trim();
  return {
    present: Boolean(value),
    prefix: key.slice(0, 10),
    length: key.length,
    hadWhitespaceOrQuotes: key !== value,
    looksValid: /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(key),
  };
}

export function createAnthropic(apiKey: string) {
  return new Anthropic({ apiKey });
}
