import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = {
  href?: string;
  variant?: "primary" | "secondary" | "outline";
  wide?: boolean;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-[6px] text-[14px] font-medium transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-40";

export function Button({
  href,
  variant = "primary",
  wide,
  children,
  className = "",
  type = "button",
  ...rest
}: Props) {
  const look =
    variant === "primary"
      ? "bg-[var(--c-btn,#111)] text-[var(--c-btnink,#fff)] hover:opacity-85"
      : variant === "outline"
        ? "border border-[#E7E4DC] bg-white text-[#37352F] hover:bg-[#F5F4F0]"
        : "bg-wash text-ink hover:bg-line";
  const cls = `${base} h-11 px-4 md:h-8 md:px-3 ${wide ? "w-full" : ""} ${look} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
