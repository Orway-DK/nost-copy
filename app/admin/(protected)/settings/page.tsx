"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import {
  SlPhone, SlEnvolope, SlLocationPin,
  SlClock, SlGlobe, SlPicture, SlCheck, SlNote, SlRefresh
} from "react-icons/sl";
// MEVCUT ACTION IMPORT EDİLDİ
import { translateTextAction } from "@/app/admin/actions";

// --- TİPLER ---
type GlobalSettings = {
  id?: number;
  logo_url: string;
  favicon_url: string;
  phone: string;
  email: string;
  working_hours: string;
  store_location_url: string;
};

type LocalizedSettings = {
  site_name: string;
  footer_text: string;
  address: string;
};

type FormState = {
  global: GlobalSettings;
  translations: Record<string, LocalizedSettings>;
};

const LANGUAGES = ["tr", "en", "de"];

const INITIAL_LOCALIZED: LocalizedSettings = { site_name: "", footer_text: "", address: "" };

export default function GeneralSettingsPage() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState("tr");

  const [formData, setFormData] = useState<FormState>({
    global: {
      logo_url: "", favicon_url: "", phone: "", email: "",
      working_hours: "", store_location_url: ""
    },
    translations: {
      tr: { ...INITIAL_LOCALIZED },
      en: { ...INITIAL_LOCALIZED },
      de: { ...INITIAL_LOCALIZED },
    }
  });

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: settings } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();

      if (settings) {
        const { data: trans } = await supabase
          .from("site_settings_translations")
          .select("*")
          .eq("settings_id", settings.id);

        const newTrans = { ...formData.translations };
        trans?.forEach((t: any) => {
          if (newTrans[t.lang_code]) {
            newTrans[t.lang_code] = {
              site_name: t.site_name || "",
              footer_text: t.footer_text || "",
              address: t.address || ""
            };
          }
        });

        setFormData({
          global: settings,
          translations: newTrans
        });
      }
      setLoading(false);
    };
    fetch();
  }, []);

  // --- KAYDETME ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: savedGlobal, error: globalError } = await supabase
        .from("site_settings")
        .upsert(formData.global.id ? formData.global : { ...formData.global, id: undefined })
        .select()
        .single();

      if (globalError) throw globalError;

      const translationsToUpsert = LANGUAGES.map(lang => ({
        settings_id: savedGlobal.id,
        lang_code: lang,
        ...formData.translations[lang]
      }));

      const { error: transError } = await supabase
        .from("site_settings_translations")
        .upsert(translationsToUpsert, { onConflict: "settings_id, lang_code" });

      if (transError) throw transError;

      toast.success("Tüm ayarlar başarıyla kaydedildi!");
      setFormData(prev => ({ ...prev, global: { ...prev.global, id: savedGlobal.id } }));

    } catch (err: any) {
      toast.error("Hata: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGlobalChange = (key: keyof GlobalSettings, val: string) => {
    setFormData(prev => ({ ...prev, global: { ...prev.global, [key]: val } }));
  };

  const handleLocalChange = (key: keyof LocalizedSettings, val: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [activeLang]: { ...prev.translations[activeLang], [key]: val }
      }
    }));
  };

  // --- YENİ: OTOMATİK ÇEVİRİLİ DAĞIT ---
  const handleDistributeLanguage = async () => {
    if (!confirm(`Şu anki (${activeLang.toUpperCase()}) metinleri Google Translate ile diğer dillere çevirip dağıtmak istiyor musunuz?`)) return;

    const toastId = toast.loading("Otomatik çeviri yapılıyor...");
    const sourceData = formData.translations[activeLang];

    // State kopyası
    const newTrans = { ...formData.translations };

    // Promise.all ile tüm dilleri paralel çevir
    await Promise.all(LANGUAGES.map(async (lang) => {
      if (lang === activeLang) return; // Kendisini atla

      // 1. Site Name (Genelde marka ismidir, çevrilmez ama yine de API'ye soralım veya direkt kopyalayalım)
      // Marka adının çevrilmesini istemiyorsan burayı direkt kopyala yapabilirsin.
      const resName = await translateTextAction(sourceData.site_name, lang, activeLang);

      // 2. Footer Text
      const resFooter = await translateTextAction(sourceData.footer_text, lang, activeLang);

      // 3. Address
      const resAddress = await translateTextAction(sourceData.address, lang, activeLang);

      newTrans[lang] = {
        site_name: resName.success ? resName.text : sourceData.site_name,
        footer_text: resFooter.success ? resFooter.text : sourceData.footer_text,
        address: resAddress.success ? resAddress.text : sourceData.address,
      };
    }));

    setFormData(prev => ({ ...prev, translations: newTrans }));
    toast.success("Çeviriler tamamlandı. Lütfen kontrol edip kaydedin.", { id: toastId });
  };

  if (loading) return <div className="p-10 text-center text-[var(--admin-muted)]">Yükleniyor...</div>;

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-20">

      {/* BAŞLIK & DİL SEÇİMİ */}
      <div className="xl:col-span-2 flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--admin-card)] p-4 rounded-xl border border-[var(--admin-card-border)] sticky top-2 z-20 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-[var(--admin-input-bg)] border border-[var(--admin-card-border)] rounded-lg p-1">
            {LANGUAGES.map(lang => (
              <button
                type="button"
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-4 py-1.5 rounded-md font-bold uppercase transition-all ${activeLang === lang
                    ? "bg-[var(--admin-info)] text-white shadow-sm"
                    : "text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
                  }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Çevir & Dağıt Butonu */}
          <button
            type="button"
            onClick={handleDistributeLanguage}
            className="btn-admin border border-[var(--admin-card-border)] text-[var(--admin-accent)] hover:bg-[var(--admin-input-bg)] px-3 py-2 text-sm gap-2"
            title={`${activeLang.toUpperCase()} içeriklerini çevir ve diğer dillere kopyala`}
          >
            <SlRefresh /> <span className="hidden sm:inline">Çevir & Dağıt</span>
          </button>
        </div>

        <div className="text-sm text-[var(--admin-muted)] font-medium">
          Şu an düzenleniyor: <span className="uppercase text-[var(--admin-fg)] font-bold">{activeLang}</span>
        </div>
      </div>

      {/* SOL KOLON: Kimlik */}
      <div className="card-admin space-y-6 h-fit">
        <h3 className="text-lg font-semibold border-b border-[var(--admin-card-border)] pb-3 mb-4 flex items-center gap-2">
          <SlGlobe /> Site Kimliği & İçerik
        </h3>

        {/* Localized */}
        <div>
          <label className="admin-label">
            Site Adı (Title)
            <span className="ml-auto text-[10px] uppercase bg-[var(--admin-info)] text-white px-1.5 rounded">{activeLang}</span>
          </label>
          <input
            className="admin-input"
            value={formData.translations[activeLang].site_name}
            onChange={e => handleLocalChange("site_name", e.target.value)}
          />
        </div>

        {/* Global */}
        <div>
          <label className="admin-label">Logo URL (Global)</label>
          <div className="flex items-center gap-3">
            <SlPicture className="text-[var(--admin-muted)] text-xl" />
            <input
              className="admin-input"
              placeholder="https://..."
              value={formData.global.logo_url || ""}
              onChange={e => handleGlobalChange("logo_url", e.target.value)}
            />
          </div>
          {formData.global.logo_url && (
            <div className="mt-3 p-2 border border-dashed border-[var(--admin-card-border)] rounded bg-[var(--admin-input-bg)] inline-block">
              <img src={formData.global.logo_url} alt="Logo" className="h-10 w-auto object-contain" />
            </div>
          )}
        </div>

        {/* Localized */}
        <div>
          <label className="admin-label">
            Footer Hakkında Metni
            <span className="ml-auto text-[10px] uppercase bg-[var(--admin-info)] text-white px-1.5 rounded">{activeLang}</span>
          </label>
          <div className="flex gap-3">
            <SlNote className="text-[var(--admin-muted)] text-xl mt-2" />
            <textarea
              className="admin-textarea h-24"
              value={formData.translations[activeLang].footer_text}
              onChange={e => handleLocalChange("footer_text", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SAĞ KOLON: İletişim */}
      <div className="card-admin space-y-6 h-fit">
        <h3 className="text-lg font-semibold border-b border-[var(--admin-card-border)] pb-3 mb-4 flex items-center gap-2">
          <SlPhone /> İletişim Bilgileri
        </h3>

        {/* Global */}
        <div>
          <label className="admin-label">Telefon (Global)</label>
          <div className="flex items-center gap-3">
            <SlPhone className="text-[var(--admin-muted)] text-xl" />
            <input
              className="admin-input"
              value={formData.global.phone || ""}
              onChange={e => handleGlobalChange("phone", e.target.value)}
            />
          </div>
        </div>

        {/* Global */}
        <div>
          <label className="admin-label">E-Posta (Global)</label>
          <div className="flex items-center gap-3">
            <SlEnvolope className="text-[var(--admin-muted)] text-xl" />
            <input
              type="email"
              className="admin-input"
              value={formData.global.email || ""}
              onChange={e => handleGlobalChange("email", e.target.value)}
            />
          </div>
        </div>

        {/* Localized */}
        <div>
          <label className="admin-label">
            Açık Adres
            <span className="ml-auto text-[10px] uppercase bg-[var(--admin-info)] text-white px-1.5 rounded">{activeLang}</span>
          </label>
          <div className="flex items-center gap-3">
            <SlLocationPin className="text-[var(--admin-muted)] text-xl" />
            <textarea
              className="admin-textarea h-24"
              value={formData.translations[activeLang].address}
              onChange={e => handleLocalChange("address", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Global */}
          <div>
            <label className="admin-label">Çalışma Saatleri (Global)</label>
            <div className="flex items-center gap-3">
              <SlClock className="text-[var(--admin-muted)] text-xl" />
              <input
                className="admin-input"
                value={formData.global.working_hours || ""}
                onChange={e => handleGlobalChange("working_hours", e.target.value)}
              />
            </div>
          </div>
          {/* Global */}
          <div>
            <label className="admin-label">Harita Linki (Global)</label>
            <input
              className="admin-input"
              placeholder="Google Maps URL"
              value={formData.global.store_location_url || ""}
              onChange={e => handleGlobalChange("store_location_url", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="xl:col-span-2 flex justify-end">
        <button type="submit" disabled={saving} className="btn-admin btn-admin-primary px-8 py-3 text-base gap-2">
          <SlCheck /> {saving ? "Kaydediliyor..." : "Tümünü Kaydet"}
        </button>
      </div>
    </form>
  );
}