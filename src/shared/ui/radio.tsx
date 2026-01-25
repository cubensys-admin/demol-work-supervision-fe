import { InputHTMLAttributes, forwardRef } from 'react';
import { classNames } from '@/shared/lib/classNames';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className, id, ...rest }, ref) => {
    const radioId = id || `radio-${label?.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <label htmlFor={radioId} className="flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          id={radioId}
          type="radio"
          className={classNames(
            'h-4 w-4 cursor-pointer border border-gray-300 text-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...rest}
        />
        {label && <span className="text-sm text-heading">{label}</span>}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
