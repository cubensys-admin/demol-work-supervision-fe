import { ReactNode, cloneElement, isValidElement } from 'react';
import { classNames } from '@/shared/lib/classNames';

interface SelectCardGroupProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  mode?: 'single' | 'multiple';
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  gridCols?: 2 | 3 | 4;
  disabled?: boolean;
  children: ReactNode;
}

export function SelectCardGroup({
  value,
  onChange,
  mode = 'single',
  label,
  error,
  helperText,
  className,
  gridCols = 3,
  disabled = false,
  children,
}: SelectCardGroupProps) {
  const handleChange = (itemValue: string, checked: boolean) => {
    if (!onChange) return;

    if (mode === 'single') {
      // Single selection mode
      onChange(checked ? itemValue : '');
    } else {
      // Multiple selection mode
      const currentValues = Array.isArray(value) ? value : [];
      if (checked) {
        // Add value
        onChange([...currentValues, itemValue]);
      } else {
        // Remove value
        onChange(currentValues.filter((v) => v !== itemValue));
      }
    }
  };

  const isChecked = (itemValue: string): boolean => {
    if (mode === 'single') {
      return value === itemValue;
    } else {
      return Array.isArray(value) && value.includes(itemValue);
    }
  };

  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      {label && (
        <label className="text-sm font-medium text-heading">
          {label}
        </label>
      )}
      <div className={classNames('grid gap-3 grid-cols-1', gridColsClass[gridCols])}>
        {Array.isArray(children)
          ? children.map((child) => {
              if (isValidElement(child) && (child.props as { value?: string }).value) {
                const itemValue = (child.props as { value?: string }).value as string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return cloneElement(child as any, {
                  key: itemValue,
                  checked: isChecked(itemValue),
                  onChange: handleChange,
                  disabled,
                });
              }
              return child;
            })
          : isValidElement(children) && (children.props as { value?: string }).value
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cloneElement(children as any, {
              checked: isChecked((children.props as { value?: string }).value as string),
              onChange: handleChange,
              disabled,
            })
          : children}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
      {helperText && !error && <span className="text-[14px] font-medium" style={{ color: '#666666' }}>{helperText}</span>}
    </div>
  );
}
