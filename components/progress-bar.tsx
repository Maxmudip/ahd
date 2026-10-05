export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1 overflow-hidden rounded-full bg-line">
      <div className="h-full rounded-full bg-[#C9A84C] transition-[width] duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}
