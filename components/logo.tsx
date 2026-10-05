import Link from "next/link";

export function OliveBranch({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M5 20c2.2-4.2 4.2-7.6 7.6-12.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M8.2 16.6c2.1-.1 3.6-1.8 3.8-3.4-1.8.4-3.4 1.6-3.8 3.4Z" fill="currentColor" />
      <path d="M11.2 12.6c2-.1 3.6-1.7 4-3.3-1.8.3-3.5 1.5-4 3.3Z" fill="currentColor" />
      <path d="M14.1 8.7c1.8 0 3.2-1.4 3.6-2.8-1.6.2-3.2 1.2-3.6 2.8Z" fill="currentColor" />
      <ellipse cx="18.6" cy="5.2" rx="1.7" ry="2.15" transform="rotate(-32 18.6 5.2)" fill="currentColor" />
    </svg>
  );
}

export function Logo({
  href = "/",
  light = false,
  large = false,
}: {
  href?: string;
  light?: boolean;
  large?: boolean;
}) {
  const mark = large ? "h-7 w-7" : "h-5 w-5";
  const word = large ? "text-[16px]" : "text-[15px]";
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-2">
      <OliveBranch className={`${mark} text-[#C9A84C]`} />
      <span
        className={`font-semibold tracking-[-0.03em] ${word} ${light ? "text-white" : "text-[var(--c-ink,#111)]"}`}
      >
        Ahd
      </span>
    </Link>
  );
}
