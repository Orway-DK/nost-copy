'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className='h-64 bg-gray-100 animate-pulse rounded-lg'>
      Editör Yükleniyor...
    </div>
  )
})

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }], // Toolbar'da butonlar kalsın
    ['link', 'image'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false // Satır aralıklarını koru
  }
}

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list', // DÜZELTME: 'bullet' sildik, çünkü 'list' ikisini de kapsar
  'link',
  'image',
  'break' // <br> tag'ini destekle
]

type Props = {
  value: string
  onChange: (val: string) => void
}
export default function RichTextEditor ({ value, onChange }: Props) {
  return (
    <div className='bg-white text-black rounded-lg overflow-hidden border border-gray-300'>
      {/* 1. CSS Override: Bu style bloğu editörün içindeki taşmayı engeller */}
      <style jsx global>{`
        .ql-editor {
          min-height: 200px;
          max-height: 600px;
          overflow-y: auto;
          word-break: break-word; /* Kelimeleri kır */
          overflow-wrap: break-word;
        }
        .ql-container {
          font-size: 16px; /* Yazı boyutu okunabilir olsun */
        }
      `}</style>

      <ReactQuill
        theme='snow'
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        className='h-96 mb-12 sm:mb-10'
      />
    </div>
  )
}
