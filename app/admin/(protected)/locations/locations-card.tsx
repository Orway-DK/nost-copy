// C:\Projeler\nost-copy\app\admin\(protected)\showcase\landing\page.tsx
'use client'

import {
  SlPencil,
  SlTrash,
  SlLocationPin,
  SlMap,
  SlPhone,
  SlEnvolope
} from 'react-icons/sl'

interface LocationsCardProps {
  locations: any[]
  editingId: number | null
  onEdit: (loc: any) => void
  onDelete: (id: number) => void
}

export default function LocationsCard ({
  locations,
  editingId,
  onEdit,
  onDelete
}: LocationsCardProps) {
  return (
    <div className='card-admin p-0 overflow-hidden h-full flex flex-col'>
      {/* Kart Başlığı */}
      <div className='px-6 py-4 border-b border-[var(--admin-card-border)] bg-[var(--admin-bg)] flex justify-between items-center'>
        <h3 className='font-bold text-lg text-[var(--admin-fg)]'>
          Lokasyon Listesi
        </h3>
        <span className='badge-admin badge-admin-default'>
          {locations.length} Kayıt
        </span>
      </div>

      {locations.length === 0 ? (
        <div className='p-12 text-center flex flex-col items-center justify-center text-[var(--admin-muted)]'>
          <SlLocationPin className='text-4xl mb-3 opacity-30' />
          <p>Henüz hiç lokasyon eklenmemiş.</p>
          <p className='text-xs mt-1'>
            Soldaki formu kullanarak yeni bir ofis ekleyin.
          </p>
        </div>
      ) : (
        <>
          {/* --- MOBİL GÖRÜNÜM (KARTLAR) --- */}
          {/* Sadece mobilde görünür (block), md ve üstünde gizlenir (hidden) */}
          <div className='block md:hidden divide-y divide-[var(--admin-card-border)]'>
            {locations.map(loc => (
              <div
                key={loc.id}
                className={`p-4 flex flex-col gap-3 transition-colors ${
                  editingId === loc.id
                    ? 'bg-[var(--admin-input-bg)] ring-1 ring-inset ring-[var(--admin-info)]'
                    : 'bg-[var(--admin-card)]'
                }`}
              >
                {/* Üst Satır: Başlık ve Koordinat */}
                <div className='flex justify-between items-start'>
                  <div className='flex items-center gap-2 font-bold text-[var(--admin-fg)]'>
                    <SlLocationPin className='text-[var(--admin-accent)] shrink-0' />
                    {loc.title}
                  </div>
                  <div className='font-mono text-[10px] bg-[var(--admin-input-bg)] px-1.5 py-0.5 rounded border border-[var(--admin-card-border)] text-[var(--admin-muted)] whitespace-nowrap'>
                    {Number(loc.lat).toFixed(2)}, {Number(loc.lng).toFixed(2)}
                  </div>
                </div>

                {/* Orta Satır: Adres */}
                <div className='text-sm text-[var(--admin-muted)] leading-relaxed pl-6'>
                  {loc.address}
                </div>

                {/* Alt Satır: İletişim Bilgileri (Varsa) */}
                {(loc.phone || loc.email || loc.map_url) && (
                  <div className='flex flex-wrap gap-2 pl-6'>
                    {loc.phone && (
                      <span className='text-xs flex items-center gap-1 text-[var(--admin-fg)] bg-[var(--admin-bg)] px-2 py-1 rounded border border-[var(--admin-card-border)]'>
                        <SlPhone size={10} /> {loc.phone}
                      </span>
                    )}
                    {loc.map_url && (
                      <a
                        href={loc.map_url}
                        target='_blank'
                        rel='noreferrer'
                        className='text-xs flex items-center gap-1 text-[var(--admin-info)] bg-[var(--admin-bg)] px-2 py-1 rounded border border-[var(--admin-card-border)] hover:bg-[var(--admin-input-bg)]'
                      >
                        <SlMap size={10} /> Harita
                      </a>
                    )}
                  </div>
                )}

                {/* En Alt: Butonlar */}
                <div className='flex gap-2 mt-2 pt-3 border-t border-[var(--admin-card-border)]'>
                  <button
                    onClick={() => onEdit(loc)}
                    className='btn-admin btn-admin-secondary flex-1 py-2 text-sm gap-2 justify-center'
                  >
                    <SlPencil /> Düzenle
                  </button>
                  <button
                    onClick={() => onDelete(loc.id)}
                    className='btn-admin btn-admin-danger flex-1 py-2 text-sm gap-2 justify-center'
                  >
                    <SlTrash /> Sil
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* --- MASAÜSTÜ GÖRÜNÜM (TABLO) --- */}
          {/* Sadece md ve üstünde görünür (block), mobilde gizlenir (hidden) */}
          <div className='hidden md:block table-responsive flex-1'>
            <table className='w-full text-left border-collapse min-w-[600px]'>
              <thead>
                <tr className='bg-[var(--admin-input-bg)] border-b border-[var(--admin-card-border)] text-[var(--admin-muted)] text-xs uppercase tracking-wider'>
                  <th className='py-3 px-4 font-semibold w-1/3'>
                    Ofis Bilgileri
                  </th>
                  <th className='py-3 px-4 font-semibold'>İletişim</th>
                  <th className='py-3 px-4 font-semibold text-center'>
                    Koordinatlar
                  </th>
                  <th className='py-3 px-4 font-semibold text-right w-24'>
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-[var(--admin-card-border)]'>
                {locations.map(loc => (
                  <tr
                    key={loc.id}
                    className={`group transition-colors hover:bg-[var(--admin-input-bg)] ${
                      editingId === loc.id
                        ? 'bg-[var(--admin-input-bg)] ring-1 ring-inset ring-[var(--admin-info)]'
                        : ''
                    }`}
                  >
                    <td className='py-3 px-4 align-top'>
                      <div className='font-bold text-[var(--admin-fg)] flex items-center gap-2 mb-1'>
                        {loc.title}
                        {loc.map_url && (
                          <a
                            href={loc.map_url}
                            target='_blank'
                            rel='noreferrer'
                            title='Harita'
                            className='text-[var(--admin-info)] hover:text-[var(--admin-accent)]'
                          >
                            <SlMap size={14} />
                          </a>
                        )}
                      </div>
                      <div className='text-xs text-[var(--admin-muted)] leading-relaxed max-w-xs line-clamp-2'>
                        {loc.address}
                      </div>
                    </td>

                    <td className='py-3 px-4 align-top'>
                      <div className='flex flex-col gap-1'>
                        {loc.phone && (
                          <span className='text-xs text-[var(--admin-fg)] bg-[var(--admin-bg)] px-2 py-1 rounded border border-[var(--admin-card-border)] w-fit'>
                            📞 {loc.phone}
                          </span>
                        )}
                        {loc.email && (
                          <span className='text-xs text-[var(--admin-fg)] bg-[var(--admin-bg)] px-2 py-1 rounded border border-[var(--admin-card-border)] w-fit'>
                            ✉️ {loc.email}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className='py-3 px-4 align-top text-center'>
                      <div className='font-mono text-xs bg-[var(--admin-input-bg)] px-2 py-1 rounded border border-[var(--admin-card-border)] inline-block text-[var(--admin-muted)]'>
                        {Number(loc.lat).toFixed(4)},{' '}
                        {Number(loc.lng).toFixed(4)}
                      </div>
                    </td>

                    <td className='py-3 px-4 align-top text-right'>
                      <div className='flex justify-end gap-2'>
                        <button
                          onClick={() => onEdit(loc)}
                          className='btn-admin btn-admin-secondary p-2 aspect-square flex items-center justify-center text-[var(--admin-muted)] hover:text-[var(--admin-info)]'
                          title='Düzenle'
                        >
                          <SlPencil size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(loc.id)}
                          className='btn-admin btn-admin-secondary p-2 aspect-square flex items-center justify-center text-[var(--admin-muted)] hover:text-[var(--admin-danger)] hover:border-[var(--admin-danger)]'
                          title='Sil'
                        >
                          <SlTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
