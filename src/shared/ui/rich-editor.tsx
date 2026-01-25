'use client';

import { useEffect, useState } from 'react';
import { createUploadAdapterPlugin } from '@/shared/lib/ckeditor-upload-adapter';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let CKEditor: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ClassicEditor: any;

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  CKEditor = require('@ckeditor/ckeditor5-react').CKEditor;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ClassicEditor = require('@ckeditor/ckeditor5-build-classic');
}

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
  uploadUrl?: string; // Optional custom upload URL
}

export function RichEditor({
  value,
  onChange,
  placeholder = '내용을 입력해 주세요',
  minHeight = 300,
  disabled = false,
  uploadUrl = '/api/resources/ckeditor/upload', // Default to resources upload
}: RichEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !CKEditor || !ClassicEditor) {
    return (
      <div
        className="min-h-[200px] rounded border border-[#D2D2D2] bg-white px-3 py-2 text-[15px] leading-[21px] text-heading opacity-95"
        style={{ minHeight }}
      >
        <p className="text-gray-400">{placeholder}</p>
      </div>
    );
  }

  return (
    <div className="rich-editor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        disabled={disabled}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(_event: any, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          placeholder,
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'imageUpload',
            'blockQuote',
            'insertTable',
            'undo',
            'redo',
          ],
          language: 'ko',
          extraPlugins: [createUploadAdapterPlugin(uploadUrl)],
        }}
      />
      <style jsx global>{`
        .rich-editor-wrapper .ck-editor__main {
          min-height: ${minHeight}px;
        }
        .rich-editor-wrapper .ck-content {
          min-height: ${minHeight - 50}px;
          font-size: 15px;
          line-height: 1.6;
        }
        .rich-editor-wrapper .ck.ck-editor {
          border-radius: 4px;
        }
        .rich-editor-wrapper .ck.ck-editor__main>.ck-editor__editable {
          border-color: #D2D2D2;
          background: white;
          opacity: 0.95;
        }
        .rich-editor-wrapper .ck.ck-editor__main>.ck-editor__editable:focus {
          border-color: #D2D2D2;
          box-shadow: none;
        }
        .rich-editor-wrapper .ck-toolbar {
          border-color: #D2D2D2 !important;
          background: #fafafa !important;
        }
      `}</style>
    </div>
  );
}