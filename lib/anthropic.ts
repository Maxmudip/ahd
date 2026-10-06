import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-sonnet-4-5-20251001";

export function readAnthropicKey(): string | null {
  const key = (process.env.ANTHROPIC_API_KEY ?? "").trim().replace(/^["']|["']$/g, "").trim();
  return key || null;
}

export function createAnthropic(apiKey: string) {
  return new Anthropic({ apiKey });
}

export function describeKey(raw: string | undefined) {
  const value = raw ?? "";
  const key = value.trim().replace(/^["'`]|["'`]$/g, "").trim();
  return {
    present: Boolean(value),
    prefix: key.slice(0, 10),
    length: key.length,
    hadWhitespaceOrQuotes: key !== value,
    looksValid: /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(key),
  };
}
