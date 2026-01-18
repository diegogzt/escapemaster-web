"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import to avoid SSR issues with Quill
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-50 animate-pulse rounded-md" />,
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'link': true }, { 'image': true }],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image',
    'color', 'background',
    'align'
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
        <style jsx global>{`
        .ql-container {
            font-family: inherit;
            font-size: 1rem;
            border-bottom-left-radius: 0.75rem;
            border-bottom-right-radius: 0.75rem;
            border-color: var(--color-beige);
            background-color: var(--color-background-soft);
            color: var(--color-foreground);
        }
        .ql-toolbar {
            border-top-left-radius: 0.75rem;
            border-top-right-radius: 0.75rem;
            border-color: var(--color-beige);
            background-color: var(--color-background);
            border-bottom: 1px solid var(--color-beige);
        }
        .ql-editor {
            min-height: 200px;
        }
        .ql-stroke {
            stroke: var(--color-foreground) !important;
        }
        .ql-fill {
            fill: var(--color-foreground) !important;
        }
        .ql-picker {
            color: var(--color-foreground) !important;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
