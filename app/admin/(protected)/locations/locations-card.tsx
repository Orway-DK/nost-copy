'use client'

interface LocationsCardProps {
    locations: any[]
    editingId: number | null
    onEdit: (loc: any) => void
    onDelete: (id: number) => void
}

export default function LocationsCard({ locations, editingId, onEdit, onDelete }: LocationsCardProps) {
    return (
        <div className="card-admin p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] flex justify-between items-center">
                <h2 className="font-semibold">Mevcut Lokasyonlar ({locations.length})</h2>
            </div>

            {locations.length === 0 ? (
                <div className="p-8 text-center opacity-60">Henüz hiç lokasyon eklenmemiş.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table-admin border-none rounded-none">
                        <thead className="thead-admin">
                            <tr>
                                <th className="th-admin">Ofis Bilgileri</th>
                                <th className="th-admin">Koordinatlar</th>
                                <th className="th-admin text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map(loc => (
                                <tr key={loc.id} className={`tr-admin row-admin-hover ${editingId === loc.id ? 'bg-[var(--admin-input-bg)]' : ''}`}>
                                    <td className="td-admin">
                                        <div className="font-medium text-base">{loc.title}</div>
                                        <div className="admin-help mt-1 max-w-xs truncate">{loc.address}</div>
                                        <div className="text-xs opacity-60 mt-2 flex gap-2">
                                            {loc.phone && <span className="badge-admin badge-admin-default">📞 {loc.phone}</span>}
                                            {loc.email && <span className="badge-admin badge-admin-default">✉️ {loc.email}</span>}
                                        </div>
                                    </td>
                                    <td className="td-admin">
                                        <div className="badge-admin badge-admin-info font-mono">
                                            {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}
                                        </div>
                                    </td>
                                    <td className="td-admin text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onEdit(loc)}
                                                className="btn-admin btn-admin-secondary py-1 px-3 text-xs"
                                            >
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => onDelete(loc.id)}
                                                className="btn-admin btn-admin-danger py-1 px-3 text-xs"
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}