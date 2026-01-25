import { SelectHTMLAttributes } from 'react';
import { classNames } from '@/shared/lib/classNames';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Select({ label, error, helperText, className, id, children, ...rest }: SelectProps) {
  const selectId = id || `select-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  // Extract width-related classes from className for the wrapper
  const widthMatch = className?.match(/w-\[[\d]+px\]|w-[\w]+/);
  const wrapperWidth = widthMatch ? widthMatch[0] : 'w-full';
  const selectClassName = className?.replace(/w-\[[\d]+px\]|w-[\w]+/g, '').trim();

  return (
    <div className={`flex flex-col gap-1 ${wrapperWidth}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-heading">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={classNames(
          'h-9 w-full rounded border border-border-light bg-white px-4 text-[14px] text-black focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-70',
          error ? 'border-red-500 focus:border-red-500' : '',
          selectClassName,
        )}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
      {helperText && !error && <span className="text-xs text-muted-foreground">{helperText}</span>}
    </div>
  );
}
