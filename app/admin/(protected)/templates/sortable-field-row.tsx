'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IoTrash, IoMenu, IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { TemplateField, FieldType } from '@/types';

interface Props {
  field: TemplateField;
  index: number;
  onUpdate: (index: number, key: keyof TemplateField, value: any) => void;
  onRemove: (index: number) => void;
}

export function SortableFieldRow({ field, index, onUpdate, onRemove }: Props) {
  // Açılır/Kapanır durumu kontrol eden state
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex flex-col border border-admin-input-border rounded-admin bg-admin-input-bg/40 relative group transition-all mb-3 overflow-hidden
        ${isExpanded ? 'bg-admin-input-bg border-admin-accent shadow-sm' : 'hover:border-admin-card-border'}
      `}
    >
      {/* --- 1. HEADER (HER ZAMAN GÖRÜNÜR) --- */}
      <div className="flex items-center gap-3 p-3">
        
        {/* A. DRAG HANDLE */}
        <div 
          {...attributes} 
          {...listeners} 
          className="shrink-0 cursor-grab active:cursor-grabbing text-admin-muted hover:text-admin-fg p-1"
          title="Sıralamak için sürükleyin"
        >
          <IoMenu size={22} />
        </div>

        {/* B. LABEL INPUT (Görünecek Ad) */}
        <div className="flex-1">
            <input
                className="admin-input text-admin-sm font-medium h-10 bg-transparent border-transparent focus:bg-admin-input-bg focus:border-admin-accent placeholder:font-normal"
                value={field.label}
                placeholder="Özellik Adı (Örn: Beden, Renk)"
                onClick={(e) => e.stopPropagation()} // Tıklayınca expand olmasın (opsiyonel)
                onChange={e => {
                    const val = e.target.value;
                    onUpdate(index, 'label', val);
                    
                    // Key boşsa otomatik oluştur (Body kapalı olsa bile çalışır)
                    if (!field.key) {
                        const slug = val
                        .toLowerCase()
                        .replace(/ /g, '_')
                        .replace(/ı/g, 'i')
                        .replace(/ğ/g, 'g')
                        .replace(/ü/g, 'u')
                        .replace(/ş/g, 's')
                        .replace(/ö/g, 'o')
                        .replace(/ç/g, 'c')
                        .replace(/[^a-z0-9_]/g, '');
                        onUpdate(index, 'key', slug);
                    }
                }}
            />
        </div>

        {/* C. ACTIONS (SİL & EXPAND) */}
        <div className="flex items-center gap-1">
            {/* Sil Butonu */}
            <button
                onClick={() => onRemove(index)}
                className="p-2 rounded text-admin-muted hover:bg-admin-danger hover:text-white transition-colors"
                title="Alanı Sil"
            >
                <IoTrash size={18} />
            </button>

            {/* Ayraç */}
            <div className="w-px h-5 bg-admin-card-border mx-1"></div>

            {/* Expand/Collapse Butonu */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-2 rounded text-admin-muted hover:bg-admin-input-border hover:text-admin-fg transition-colors ${isExpanded ? 'bg-admin-input-border text-admin-fg' : ''}`}
                title={isExpanded ? "Daralt" : "Detayları Göster"}
            >
                {isExpanded ? <IoChevronUp size={18} /> : <IoChevronDown size={18} />}
            </button>
        </div>
      </div>

      {/* --- 2. BODY (SADECE EXPAND İSE GÖRÜNÜR) --- */}
      {isExpanded && (
        <div className="p-4 border-t border-admin-input-border bg-admin-bg/50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Key Field */}
            <div>
                <label className='text-admin-tiny opacity-50 uppercase font-bold mb-1 block'>
                    Veri Anahtarı (Key - Otomatik)
                </label>
                <input
                    className='admin-input text-admin-sm font-mono text-admin-accent h-9'
                    value={field.key}
                    onChange={e => onUpdate(index, 'key', e.target.value)}
                    placeholder='örn: color'
                />
                <p className="text-[10px] text-admin-muted mt-1">Veritabanında saklanacak değişken adı.</p>
            </div>

            {/* Type Field */}
            <div>
                <label className='text-admin-tiny opacity-50 uppercase font-bold mb-1 block'>
                    Veri Tipi
                </label>
                <select
                    className='admin-select text-admin-sm h-9'
                    value={field.type}
                    onChange={e =>
                    onUpdate(index, 'type', e.target.value as FieldType)
                    }
                >
                    <option value='text'>Yazı (Text)</option>
                    <option value='number'>Sayı (Number)</option>
                    <option value='select'>Seçim (Dropdown)</option>
                    <option value='checkbox'>Onay (Checkbox)</option>
                    <option value='paper'>Kağıt & Gramaj (Stoktan)</option>
                </select>
            </div>

            {/* Options / Required Field */}
            <div className="md:col-span-2">
                {field.type === 'select' ? (
                    <div>
                        <label className='text-admin-tiny opacity-50 uppercase font-bold mb-1 block'>
                            Seçenekler (Virgülle Ayırın)
                        </label>
                        <input
                            className='admin-input text-admin-sm h-9'
                            value={field.options?.join(',') || ''}
                            onChange={e =>
                            onUpdate(index, 'options', e.target.value.split(','))
                            }
                            placeholder='Örn: S, M, L, XL'
                        />
                    </div>
                ) : (
                    <div className='flex items-center gap-2 p-2 border border-admin-input-border rounded bg-admin-card w-fit'>
                        <input
                            type='checkbox'
                            id={`req-${field.id}`}
                            className='w-4 h-4 rounded border-admin-input-border accent-admin-accent'
                            checked={field.required}
                            onChange={e =>
                            onUpdate(index, 'required', e.target.checked)
                            }
                        />
                        <label
                            htmlFor={`req-${field.id}`}
                            className='text-admin-tiny cursor-pointer select-none font-bold text-admin-fg'
                        >
                            Bu alanın doldurulması zorunludur
                        </label>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}