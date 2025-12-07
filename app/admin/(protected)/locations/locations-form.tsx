'use client'

interface LocationsFormProps {
    form: any
    setForm: (form: any) => void
    loading: boolean
    editingId: number | null
    onSubmit: (e: React.FormEvent) => void
    onCancel: () => void
}

export default function LocationsForm({
    form,
    setForm,
    loading,
    editingId,
    onSubmit,
    onCancel
}: LocationsFormProps) {

    return (
        <div className="card-admin sticky top-6 transition-all duration-300">
            <div className="flex items-center justify-between mb-6 border-b border-[var(--admin-card-border)] pb-3">
                <h2 className="font-semibold text-lg">
                    {editingId ? 'Ofisi Düzenle' : 'Yeni Ofis Ekle'}
                </h2>
                {editingId && (
                    <span className="badge-admin badge-admin-info">Düzenleme Modu</span>
                )}
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="admin-label">Ofis Adı</label>
                    <input
                        className="admin-input"
                        placeholder="Örn: Nost Copy Berlin"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="admin-label">Açık Adres</label>
                    <textarea
                        className="admin-textarea"
                        placeholder="Cadde, sokak, kapı no..."
                        value={form.address}
                        onChange={e => setForm({ ...form, address: e.target.value })}
                    />
                </div>

                <div>
                    <label className="admin-label">Google Maps Linki (Opsiyonel)</label>
                    <input
                        className="admin-input"
                        placeholder="https://goo.gl/maps/..."
                        value={form.map_url || ''}
                        onChange={e => setForm({ ...form, map_url: e.target.value })}
                    />
                    <p className="text-[10px] opacity-60 mt-1">Haritada "Konuma Git" butonu için kullanılır.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="admin-label">Enlem (Lat)</label>
                        <input
                            type="number" step="any"
                            className="admin-input"
                            placeholder="41.0082"
                            value={form.lat}
                            onChange={e => setForm({ ...form, lat: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="admin-label">Boylam (Lng)</label>
                        <input
                            type="number" step="any"
                            className="admin-input"
                            placeholder="28.9784"
                            value={form.lng}
                            onChange={e => setForm({ ...form, lng: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <p className="alert-admin alert-admin-info text-xs">
                    ℹ️ Google Maps'te sağ tıkla koordinat alabilirsin.
                </p>

                <div className="grid grid-cols-1 gap-3">
                    <div>
                        <label className="admin-label">Telefon</label>
                        <input
                            className="admin-input"
                            placeholder="+90 555 ..."
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="admin-label">E-posta</label>
                        <input
                            className="admin-input"
                            placeholder="info@nostcopy.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                </div>

                {/* BUTONLAR */}
                <div className="flex gap-2 mt-2">
                    {editingId && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-admin btn-admin-secondary flex-1"
                        >
                            Vazgeç
                        </button>
                    )}
                    <button
                        disabled={loading}
                        className={`btn-admin btn-admin-primary flex-1 ${editingId ? 'bg-[var(--admin-info)]' : ''}`}
                    >
                        {loading ? 'İşleniyor...' : (editingId ? 'Güncelle' : 'Kaydet')}
                    </button>
                </div>
            </form>
        </div>
    )
}