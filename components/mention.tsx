export function Mention({ name }: { name: string }) {
  return (
    <span className="inline-flex max-w-full items-center truncate rounded-[3px] bg-[#F6EFD9] px-1 py-px text-[14px] leading-5 font-medium text-[#8A6B2E]">
      @{name}
    </span>
  );
}
