import { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { classNames } from "@/shared/lib/classNames";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary" | "reset";
  size?: "md" | "sm";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2.5 rounded px-5 font-medium text-[15px] leading-[21px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap";
  const variants: Record<typeof variant, string> = {
    primary:
      "bg-[#0D77DE] text-white hover:bg-[#0B65BE] active:bg-[#0A5AA8] focus-visible:ring-[#0D77DE]",
    secondary:
      "border border-slate-300 bg-white text-heading hover:border-primary hover:text-primary active:bg-primary-50 focus-visible:ring-primary-600",
    reset:
      "bg-[#646F7C] text-white hover:bg-[#515963] active:bg-[#424952] focus-visible:ring-[#646F7C]",
  };
  const sizes: Record<typeof size, string> = {
    md: "h-9",
    sm: "h-8 px-4 text-sm",
  };

  return (
    <button
      className={classNames(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
