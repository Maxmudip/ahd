"use client";

/**
 * AI Mediator UI. These are live-session widgets: they are rendered from local page state and are never
 * part of `deal.messages`, so they are not saved to Supabase, counted as messages or shown to other users.
 * Colours are fixed (not theme tokens) so the amber card reads the same in light and dark mode.
 */

export type MediatorTipData = {
  id: string;
  /** Id of the chat message this tip appears after. */
  afterId: string | null;
  text: string;
};

export function MediatorTip({
  tip,
  onDiscuss,
  onIgnore,
}: {
  tip: MediatorTipData;
  onDiscuss: () => void;
  onIgnore: () => void;
}) {
  return (
    <div className="flex w-full justify-start" data-ai-mediator-tip>
      <div
        role="note"
        className="bubble-in origin-them mr-auto w-full max-w-[92%] rounded-[8px] border-l-[3px] border-l-[#C9A84C] bg-[#FFFBEB] px-3.5 py-3 text-[#3B2F0B] shadow-[0_1px_2px_rgba(0,0,0,0.08)] md:max-w-[520px]"
      >
        <p className="text-[12px] font-semibold tracking-[0.01em] text-[#A8841F]">💡 Ahd AI tavsiyasi</p>
        <p className="mt-1.5 text-[14.5px] leading-[1.45] break-anywhere whitespace-pre-wrap">{tip.text}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDiscuss}
            className="h-11 rounded-[6px] bg-[#C9A84C] px-3 text-[12.5px] font-medium text-[#111] hover:bg-[#BD9B3F] md:h-8"
          >
            Muhokama qilish
          </button>
          <button
            type="button"
            onClick={onIgnore}
            className="h-11 rounded-[6px] border border-[#E6D9AE] px-3 text-[12.5px] font-medium text-[#7A6A3A] hover:bg-[#F7EFD2] md:h-8"
          >
            E&apos;tiborsiz qoldirish
          </button>
        </div>
      </div>
    </div>
  );
}

/** Subtle "AI is analysing" indicator with animated dots, shown before a tip appears. */
export function MediatorTyping() {
  return (
    <div className="flex w-full justify-start" role="status" aria-live="polite">
      <div className="bubble-in origin-them mr-auto inline-flex items-center gap-2 rounded-full border border-[#E6D9AE] bg-[#FFFBEB] px-3 py-1.5 text-[12.5px] text-[#7A6A3A]">
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="typing-dot h-1.5 w-1.5 rounded-full bg-[#C9A84C]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
        AI tahlil qilmoqda...
      </div>
    </div>
  );
}
