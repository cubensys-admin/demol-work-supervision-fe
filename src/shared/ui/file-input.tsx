'use client';

import { useRef, ChangeEvent } from 'react';
import { classNames } from '@/shared/lib/classNames';

interface FileInputProps {
  value?: File | File[] | null;
  onChange?: (files: File | File[] | null) => void;
  accept?: string;
  multiple?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  width?: string;
}

export function FileInput({
  value,
  onChange,
  accept,
  multiple = false,
  error,
  helperText,
  disabled = false,
  className,
  width = '100%',
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      onChange?.(null);
      return;
    }

    if (multiple) {
      onChange?.(Array.from(files));
    } else {
      onChange?.(files[0]);
    }
  };

  const getDisplayText = () => {
    if (!value) return '선택된 파일 없음';

    if (Array.isArray(value)) {
      if (value.length === 0) return '선택된 파일 없음';
      if (value.length === 1) return value[0].name;
      return `${value[0].name} 외 ${value.length - 1}개`;
    }

    return value.name;
  };

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <div
          className="flex h-9 items-center rounded-md bg-[#F1F5F9] px-4 text-[14px] font-medium line-clamp-1"
          style={{ width, color: value ? 'black' : '#666666' }}
        >
          {getDisplayText()}
        </div>

        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled}
          className={classNames(
            'flex h-[38px] w-16 items-center justify-center whitespace-nowrap rounded-md bg-white text-[14px] font-medium transition-colors hover:bg-[#EFF6FF]',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          style={{ border: '1px solid #0082FF', color: '#0082FF' }}
        >
          파일 선택
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      {error && <span className="text-xs text-red-500">{error}</span>}
      {helperText && !error && (
        <span className="text-xs text-[#666666]">{helperText}</span>
      )}
    </div>
  );
}
