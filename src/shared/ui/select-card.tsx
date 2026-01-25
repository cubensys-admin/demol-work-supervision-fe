import { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

interface SelectCardProps {
  value: string;
  checked?: boolean;
  onChange?: (value: string, checked: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export function SelectCard({
  value,
  checked = false,
  onChange,
  disabled = false,
  children,
  className,
}: SelectCardProps) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(value, !checked);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={classNames(
        'relative flex h-12 items-center justify-center rounded-md border px-4 text-center text-[14px] font-medium transition-all',
        checked
          ? 'border-[#0082FF] bg-[#EFF6FF] text-[#0082FF]'
          : 'border-[#666666] bg-[#F4F6F9] text-[#666666] hover:border-[#0082FF]',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      {checked && (
        <svg
          className="absolute right-2 top-2 h-5 w-5 text-[#0082FF]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <div className="w-full">{children}</div>
    </button>
  );
}
