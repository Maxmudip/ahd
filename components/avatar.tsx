const TINTS: [string, string][] = [
  ["#EADFC2", "#6B5520"],
  ["#DCE3D0", "#46552E"],
  ["#EFD9CF", "#7A4630"],
  ["#DAD7CF", "#4A463E"],
  ["#D5DEE6", "#35505F"],
  ["#E8D6DD", "#6A3A4C"],
];

function tint(seed: string) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[hash % TINTS.length];
}

const SIZES = {
  sm: "h-5 w-5 text-[9px]",
  md: "h-6 w-6 text-[10px]",
  lg: "h-7 w-7 text-[11px]",
  hd: "h-10 w-10 text-[14px]",
  xl: "h-12 w-12 text-[16px]",
} as const;

export function Avatar({
  initials,
  size = "md",
  className = "",
}: {
  initials: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [bg, fg] = tint(initials);
  return (
    <span
      style={{ background: bg, color: fg }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${SIZES[size]} ${className}`}
    >
      {initials}
    </span>
  );
}
