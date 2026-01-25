import { InputHTMLAttributes } from 'react';
import { classNames } from '@/shared/lib/classNames';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function TextField({ label, error, helperText, className, id, ...rest }: TextFieldProps) {
  const inputId = id || `textfield-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  // Extract width-related classes from className for the wrapper
  const widthMatch = className?.match(/w-\[[\d]+px\]|w-[\w]+/);
  const wrapperWidth = widthMatch ? widthMatch[0] : 'w-full';
  const inputClassName = className?.replace(/w-\[[\d]+px\]|w-[\w]+/g, '').trim();

  return (
    <div className={`flex flex-col gap-1 ${wrapperWidth}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-heading">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={classNames(
          'h-9 w-full rounded-md border bg-white px-4 text-[14px] text-black placeholder:text-[#D2D2D2] placeholder:font-medium focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-70',
          error ? 'border-red-500 focus:border-red-500' : 'border-border-neutral focus:border-border-neutral',
          inputClassName,
        )}
        {...rest}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
      {helperText && !error && <span className="text-xs text-muted-foreground">{helperText}</span>}
    </div>
  );
}
