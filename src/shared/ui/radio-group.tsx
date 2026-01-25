import { ReactNode, cloneElement, isValidElement } from 'react';
import { classNames } from '@/shared/lib/classNames';

interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: ReactNode;
  error?: string;
  helperText?: string;
  direction?: 'horizontal' | 'vertical';
  centered?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function RadioGroup({
  name,
  value,
  onChange,
  label,
  error,
  helperText,
  direction = 'horizontal',
  centered = false,
  disabled = false,
  className,
  children,
}: RadioGroupProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={classNames('flex flex-col gap-2', centered && 'items-center justify-center', className)}>
      {label && (
        <label className="text-sm font-medium text-heading">
          {label}
        </label>
      )}
      <div
        className={classNames(
          'flex gap-4',
          direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
          centered && 'justify-center',
        )}
      >
        {Array.isArray(children)
          ? children.map((child) => {
              if (isValidElement(child)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return cloneElement(child as any, {
                  key: child.key,
                  name,
                  checked: (child.props as { value?: string }).value === value,
                  onChange: handleChange,
                  disabled,
                });
              }
              return child;
            })
          : isValidElement(children)
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cloneElement(children as any, {
              name,
              checked: (children.props as { value?: string }).value === value,
              onChange: handleChange,
              disabled,
            })
          : children}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
      {helperText && !error && <span className="text-xs text-muted-foreground">{helperText}</span>}
    </div>
  );
}
