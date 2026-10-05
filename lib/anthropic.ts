import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

export function readAnthropicKey(): string | null {
  const key = (process.env.ANTHROPIC_API_KEY ?? "").trim().replace(/^["']|["']$/g, "").trim();
  return key || null;
}

export function createAnthropic(apiKey: string) {
  return new Anthropic({ apiKey });
}
