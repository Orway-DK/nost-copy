"use client";

import {
  SlPencil,
  SlTrash,
  SlLocationPin,
  SlMap,
  SlStar,
} from "react-icons/sl";

interface LocationsCardProps {
  locations: any[];
  editingId: number | null;
  onEdit: (loc: any) => void;
  onDelete: (id: number) => void;
}

const FLAGS: Record<string, string> = {
  tr: "🇹🇷",
  en: "🇬🇧",
  de: "🇩🇪",
};

export default function LocationsCard({
  locations = [], // <--- DÜZELTME 1: Varsayılan değer olarak boş dizi atadık
  editingId,
  onEdit,
  onDelete,
}: LocationsCardProps) {
  // DÜZELTME 2: Güvenlik kontrolü (locations null gelirse patlamasın)
  const safeLocations = Array.isArray(locations) ? locations : [];

  return (
    <div className="card-admin p-0 overflow-hidden h-full flex flex-col">
      {/* Kart Başlığı */}
      <div className="px-6 py-4 border-b border-[var(--admin-card-border)] bg-[var(--admin-bg)] flex justify-between items-center">
        <h3 className="font-bold text-lg text-[var(--admin-fg)]">
          Ofis Listesi
        </h3>
        <span className="badge-admin badge-admin-default">
          {safeLocations.length} Kayıt {/* .length artık güvenli */}
        </span>
      </div>

      {safeLocations.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center text-[var(--admin-muted)]">
          <SlLocationPin className="text-4xl mb-3 opacity-30" />
          <p>Henüz hiç lokasyon eklenmemiş.</p>
          <p className="text-xs mt-1">
            Soldaki formu kullanarak yeni bir ofis ekleyin.
          </p>
        </div>
      ) : (
        <>
          {/* MASAÜSTÜ TABLO */}
          <div className="table-responsive flex-1">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[var(--admin-input-bg)] border-b border-[var(--admin-card-border)] text-[var(--admin-muted)] text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold w-12 text-center">
                    Dil
                  </th>
                  <th className="py-3 px-4 font-semibold w-1/3">
                    Ofis Bilgileri
                  </th>
                  <th className="py-3 px-4 font-semibold">İletişim</th>
                  <th className="py-3 px-4 font-semibold text-right w-24">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-card-border)]">
                {safeLocations.map((loc) => (
                  <tr
                    key={loc.id}
                    className={`group transition-colors hover:bg-[var(--admin-input-bg)] ${
                      editingId === loc.id
                        ? "bg-[var(--admin-input-bg)] ring-1 ring-inset ring-[var(--admin-info)]"
                        : ""
                    }`}
                  >
                    {/* Dil Bayrağı */}
                    <td className="py-3 px-4 align-top text-center text-lg">
                      {FLAGS[loc.lang_code] || "🏳️"}
                      <div className="text-[9px] uppercase font-bold text-[var(--admin-muted)]">
                        {loc.lang_code}
                      </div>
                    </td>

                    {/* Ofis Adı & Adres */}
                    <td className="py-3 px-4 align-top">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[var(--admin-fg)]">
                          {loc.title}
                        </span>
                        {loc.is_default && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200 flex items-center gap-1">
                            <SlStar size={8} /> HQ
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--admin-muted)] leading-relaxed max-w-xs line-clamp-2">
                        {loc.address}
                      </div>
                      {loc.map_url && (
                        <a
                          href={loc.map_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-[var(--admin-info)] hover:underline mt-1"
                        >
                          <SlMap size={10} /> Haritada Gör
                        </a>
                      )}
                    </td>

                    {/* İletişim */}
                    <td className="py-3 px-4 align-top">
                      <div className="flex flex-col gap-1">
                        {loc.phone && (
                          <span className="text-xs text-[var(--admin-fg)] flex items-center gap-1">
                            📞 {loc.phone}
                          </span>
                        )}
                        {loc.email && (
                          <span className="text-xs text-[var(--admin-fg)] flex items-center gap-1">
                            ✉️ {loc.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* İşlemler */}
                    <td className="py-3 px-4 align-top text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(loc)}
                          className="btn-admin btn-admin-secondary p-2 aspect-square flex items-center justify-center text-[var(--admin-muted)] hover:text-[var(--admin-info)]"
                          title="Düzenle"
                        >
                          <SlPencil size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(loc.id)}
                          className="btn-admin btn-admin-secondary p-2 aspect-square flex items-center justify-center text-[var(--admin-muted)] hover:text-[var(--admin-danger)] hover:border-[var(--admin-danger)]"
                          title="Sil"
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
  );
}
