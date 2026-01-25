import { InputHTMLAttributes } from "react";
import { classNames } from "@/shared/lib/classNames";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...rest }: InputProps) {
  return (
    <input
      className={classNames(
        "h-9 rounded border border-[#D2D2D2] bg-white px-4 text-[14px] text-black placeholder:text-[#D2D2D2] placeholder:font-medium focus:border-[#D2D2D2] focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      {...rest}
    />
  );
}
