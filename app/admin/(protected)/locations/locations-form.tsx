"use client";

import {
  SlLocationPin,
  SlMap,
  SlPhone,
  SlEnvolope,
  SlCheck,
  SlClose,
  SlStar,
  SlMagicWand,
  SlGlobe,
} from "react-icons/sl";
import { toast } from "react-hot-toast";

interface LocationsFormProps {
  form: any;
  setForm: (form: any) => void;
  loading: boolean;
  editingId: number | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const LANGUAGES = [
  { code: "tr", label: "Türkiye (TR)", flag: "🇹🇷" },
  { code: "en", label: "International (EN)", flag: "🇬🇧" },
  { code: "de", label: "Deutschland (DE)", flag: "🇩🇪" },
];

export default function LocationsForm({
  form,
  setForm,
  loading,
  editingId,
  onSubmit,
  onCancel,
}: LocationsFormProps) {
  // --- YENİLENMİŞ FONKSİYON ---
  const handleMapUrlChange = (val: string) => {
    let cleanUrl = val;

    // 1. Eğer kullanıcı tüm iframe kodunu yapıştırdıysa, sadece src'yi al
    if (val.includes("<iframe")) {
      const srcMatch = val.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        cleanUrl = srcMatch[1];
        toast.success("Iframe kodu temizlendi, link alındı.");
      }
    }

    setForm({ ...form, map_url: cleanUrl });
  };

  const extractCoordsFromLink = () => {
    const url = form.map_url;
    if (!url) {
      toast.error("Lütfen önce Google Maps linkini yapıştırın.");
      return;
    }

    let lat = null;
    let lng = null;

    // SENARYO 1: Embed Linki (pb=!1m18...!2d28.xxxx!3d41.xxxx...)
    // Embed linklerinde !3d = Enlem(Lat), !2d = Boylam(Lng) olur.
    if (url.includes("embed")) {
      const embedLatMatch = url.match(/!3d(-?\d+\.\d+)/);
      const embedLngMatch = url.match(/!2d(-?\d+\.\d+)/);

      if (embedLatMatch && embedLngMatch) {
        lat = embedLatMatch[1];
        lng = embedLngMatch[1];
      }
    }
    // SENARYO 2: Standart Link (!3d... !4d...)
    // Standart linklerde !3d = Enlem, !4d = Boylam olabilir.
    else if (url.includes("!3d") && url.includes("!4d")) {
      const pinRegex = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
      const pinMatch = url.match(pinRegex);
      if (pinMatch) {
        lat = pinMatch[1];
        lng = pinMatch[2];
      }
    }
    // SENARYO 3: Kamera Odak (@41.xxxx,28.xxxx)
    else {
      const viewRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const viewMatch = url.match(viewRegex);
      if (viewMatch) {
        lat = viewMatch[1];
        lng = viewMatch[2];
      }
    }

    if (lat && lng) {
      setForm({ ...form, lat: lat, lng: lng });
      toast.success(`Koordinatlar alındı: ${lat}, ${lng}`);
    } else {
      toast.error(
        "Link içinden koordinat okunamadı. Embed linki olduğundan emin olun."
      );
    }
  };

  return (
    <div className="card-admin shadow-lg border-t-4 border-t-[var(--admin-accent)] flex flex-col max-h-[calc(100vh-8rem)]">
      {/* HEADER */}
      <div className="shrink-0 flex items-center justify-between mb-0 border-b border-[var(--admin-card-border)] pb-3 px-1">
        <h2 className="font-bold text-lg flex items-center gap-2 text-[var(--admin-fg)]">
          <SlLocationPin className="text-[var(--admin-accent)]" />
          {editingId ? "Ofisi Düzenle" : "Yeni Ofis Ekle"}
        </h2>
        {editingId && (
          <span className="badge-admin badge-admin-info text-xs px-2">
            Düzenleniyor
          </span>
        )}
      </div>

      {/* FORM BODY */}
      <form
        onSubmit={onSubmit}
        className="flex-1 overflow-y-auto flex flex-col gap-5 py-4 pr-2 custom-scrollbar"
      >
        {/* 1. BÖLGE/DİL SEÇİMİ */}
        <div>
          <label className="admin-label flex items-center gap-2">
            <SlGlobe className="text-[var(--admin-muted)]" /> Bölge / Dil Seçimi{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setForm({ ...form, lang_code: lang.code })}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  form.lang_code === lang.code
                    ? "bg-[var(--admin-accent)]/10 text-white border-[var(--admin-accent)] shadow-md"
                    : "bg-[var(--admin-input-bg)] border-[var(--admin-card-border)] text-[var(--admin-muted)] hover:bg-[var(--admin-bg)]"
                }`}
              >
                <span className="text-xl mb-1">{lang.flag}</span>
                <span className="text-xs font-bold">
                  {lang.code.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. HQ (VARSAYILAN) SEÇİMİ */}
        <div
          className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center gap-3 shrink-0
            ${
              form.is_default
                ? "bg-[var(--admin-success)]/10 border-[var(--admin-success)]"
                : "bg-[var(--admin-input-bg)] border-[var(--admin-card-border)] hover:border-[var(--admin-muted)]"
            }`}
          onClick={() => setForm({ ...form, is_default: !form.is_default })}
        >
          <div
            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
              form.is_default
                ? "bg-[var(--admin-success)] border-[var(--admin-success)] text-white"
                : "bg-white border-[var(--admin-muted)]"
            }`}
          >
            {form.is_default && <SlCheck size={12} />}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm block text-[var(--admin-fg)]">
              {form.lang_code ? form.lang_code.toUpperCase() : ""} Bölgesi için
              Ana Merkez (HQ)
            </span>
            <span className="text-[11px] text-[var(--admin-muted)] block leading-tight">
              Site dili{" "}
              <strong>
                {form.lang_code ? form.lang_code.toUpperCase() : "..."}
              </strong>{" "}
              seçildiğinde iletişim bilgileri buradan çekilir.
            </span>
          </div>
          {form.is_default && (
            <SlStar className="ml-auto text-[var(--admin-success)] shrink-0" />
          )}
        </div>

        <hr className="border-[var(--admin-card-border)]" />

        {/* 3. GOOGLE MAPS LİNKİ & KOORDİNATLAR */}
        <div className="bg-[var(--admin-bg)]/50 p-3 rounded-xl border border-[var(--admin-card-border)]">
          <div className="mb-3">
            <label className="admin-label flex items-center gap-2 mb-1">
              <SlMap className="text-[var(--admin-muted)]" /> Google Maps
              (Embed) Linki
            </label>
            <div className="flex gap-2">
              <input
                className="admin-input text-xs flex-1 font-mono text-[var(--admin-accent)]"
                placeholder="https://www.google.com/maps/embed?pb=..."
                value={form.map_url || ""}
                onChange={(e) => handleMapUrlChange(e.target.value)}
              />
              <button
                type="button"
                onClick={extractCoordsFromLink}
                className="btn-admin btn-admin-secondary px-3 py-1 text-xs whitespace-nowrap gap-1 bg-[var(--admin-accent)] text-white hover:bg-[var(--admin-accent)]/90 border-transparent"
                title="Linkten koordinatları ayıkla"
              >
                <SlMagicWand /> Koordinatı Çek
              </button>
            </div>
            <p className="text-[10px] text-[var(--admin-muted)] mt-1 ml-1 leading-relaxed">
              * Google Maps {">"} Paylaş {">"} <strong>Harita Yerleştir</strong>{" "}
              sekmesindeki linki (src) kullanın.
              <br />
              (iframe kodunun tamamını da yapıştırabilirsiniz, otomatik
              temizlenir.)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 opacity-80">
            <div>
              <label className="text-[10px] text-[var(--admin-muted)] mb-1 block">
                Enlem (Lat)
              </label>
              <input
                type="number"
                step="any"
                className="admin-input text-xs bg-[var(--admin-card)]"
                placeholder="41.xxxx"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--admin-muted)] mb-1 block">
                Boylam (Lng)
              </label>
              <input
                type="number"
                step="any"
                className="admin-input text-xs bg-[var(--admin-card)]"
                placeholder="28.xxxx"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* 4. TEMEL BİLGİLER */}
        <div className="space-y-4">
          <div>
            <label className="admin-label flex items-center gap-2">
              Ofis Adı <span className="text-red-500">*</span>
            </label>
            <input
              className="admin-input"
              placeholder="Örn: Berlin Showroom"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="admin-label flex items-center gap-2">
              <SlMap className="text-[var(--admin-muted)]" /> Açık Adres
            </label>
            <textarea
              className="admin-textarea min-h-[80px]"
              placeholder="Cadde, sokak, kapı no..."
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="admin-label flex items-center gap-2">
                <SlPhone className="text-[var(--admin-muted)]" /> Telefon
              </label>
              <input
                className="admin-input"
                placeholder="+49 30 ..."
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label flex items-center gap-2">
                <SlEnvolope className="text-[var(--admin-muted)]" /> E-Posta
              </label>
              <input
                type="email"
                className="admin-input"
                placeholder="berlin@nostcopy.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
        </div>
      </form>

      {/* FOOTER */}
      <div className="shrink-0 pt-3 mt-1 border-t border-[var(--admin-card-border)] flex gap-3">
        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-admin btn-admin-secondary flex-1 gap-2 justify-center"
          >
            <SlClose /> Vazgeç
          </button>
        )}
        <button
          type="submit"
          onClick={onSubmit}
          disabled={loading}
          className={`btn-admin btn-admin-primary flex-1 gap-2 justify-center ${
            editingId ? "bg-[var(--admin-info)]" : ""
          }`}
        >
          <SlCheck />{" "}
          {loading ? "İşleniyor..." : editingId ? "Güncelle" : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
