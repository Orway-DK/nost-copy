"use client";

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { SlPicture, SlNote, SlRefresh, SlLayers, SlGrid } from "react-icons/sl";
import { translateTextAction } from "@/app/admin/actions";
import { LangCode } from "../page";
import { CategorySettings, SettingsHandle } from "./CategorySettings";
import { AnnouncementSettings } from "./AnnouncementSettings";

// TİP TANIMLARI
type GlobalSettings = {
  id?: number;
  logo_url: string;
  favicon_url: string;
  navbar_style: "v1" | "v2"; // <--- YENİ ALAN (v1: Klasik, v2: Mega Menü)
};

type LocalizedSettings = { site_name: string; footer_text: string };
type FormState = {
  global: GlobalSettings;
  translations: Record<string, LocalizedSettings>;
};

const INITIAL_LOCALIZED: LocalizedSettings = { site_name: "", footer_text: "" };

export const GeneralSettings = forwardRef<SettingsHandle, { lang: LangCode }>(
  ({ lang }, ref) => {
    const supabase = createSupabaseBrowserClient();

    // STATE
    const [formData, setFormData] = useState<FormState>({
      global: { logo_url: "", favicon_url: "", navbar_style: "v1" },
      translations: {
        tr: { ...INITIAL_LOCALIZED },
        en: { ...INITIAL_LOCALIZED },
        de: { ...INITIAL_LOCALIZED },
      },
    });

    const categoryRef = useRef<SettingsHandle>(null);
    const announcementRef = useRef<SettingsHandle>(null);

    // VERİLERİ ÇEKME
    useEffect(() => {
      const fetch = async () => {
        const { data: settings } = await supabase
          .from("site_settings")
          .select("*")
          .limit(1)
          .maybeSingle();
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
              };
            }
          });

          setFormData({
            global: {
              id: settings.id,
              logo_url: settings.logo_url,
              favicon_url: settings.favicon_url,
              navbar_style: settings.navbar_style || "v1", // Veritabanından gelen stil veya varsayılan
            },
            translations: newTrans,
          });
        }
      };
      fetch();
    }, []);

    // DIŞARIYA AÇILAN SAVE FONKSİYONU
    useImperativeHandle(ref, () => ({
      save: async () => {
        let success = true;
        try {
          // --- 1. PAYLOAD HAZIRLIĞI ---
          // Global tablo 'site_name' istiyor (Not Null).
          const defaultSiteName =
            formData.translations["tr"]?.site_name ||
            formData.translations[lang]?.site_name ||
            "Nost Copy";

          // Global ayarları hazırla
          const globalPayload: any = {
            ...formData.global,
            site_name: defaultSiteName,
          };

          // id undefined ise payload'dan tamamen siliyoruz (Yeni kayıt için)
          if (!globalPayload.id) {
            delete globalPayload.id;
          }

          // --- 2. GLOBAL AYARLARI KAYDET (site_settings) ---
          const { data: savedGlobal, error: globalError } = await supabase
            .from("site_settings")
            .upsert(globalPayload)
            .select()
            .single();

          if (globalError) {
            console.error("Global Settings Error:", globalError.message);
            throw globalError;
          }

          if (!savedGlobal)
            throw new Error("Ayarlar kaydedilemedi (Veri dönmedi).");

          // --- 3. ÇEVİRİLERİ KAYDET (site_settings_translations) ---
          const translationsToUpsert = ["tr", "en", "de"].map((l) => ({
            settings_id: savedGlobal.id,
            lang_code: l,
            ...formData.translations[l],
          }));

          const { error: transError } = await supabase
            .from("site_settings_translations")
            .upsert(translationsToUpsert, {
              onConflict: "settings_id, lang_code",
            });

          if (transError) {
            console.error("Translation Error:", transError.message);
            throw transError;
          }

          // State'i güncelle (yeni ID geldiyse işlensin)
          setFormData((prev) => ({
            ...prev,
            global: { ...prev.global, id: savedGlobal.id },
          }));

          // --- 4. ALT BİLEŞENLERİ KAYDET ---
          if (categoryRef.current) {
            const catRes = await categoryRef.current.save();
            if (!catRes) success = false;
          }
          if (announcementRef.current) {
            const annRes = await announcementRef.current.save();
            if (!annRes) success = false;
          }
        } catch (err: any) {
          console.error("SAVE ERROR DETAYI:", JSON.stringify(err, null, 2));
          toast.error("Kaydetme hatası: " + (err.message || "Bilinmeyen hata"));
          success = false;
        }
        return success;
      },
    }));

    // ÇEVİRİ BUTONU AKSİYONU
    const handleTranslate = async () => {
      if (
        !confirm(
          `${lang.toUpperCase()} verilerini diğer dillere çevirmek istiyor musunuz?`
        )
      )
        return;
      const toastId = toast.loading("Çevriliyor...");
      const src = formData.translations[lang];
      const newTrans = { ...formData.translations };
      await Promise.all(
        ["tr", "en", "de"].map(async (l) => {
          if (l === lang) return;
          const t1 = await translateTextAction(src.site_name, l, lang);
          const t2 = await translateTextAction(src.footer_text, l, lang);
          newTrans[l] = {
            site_name: t1.success ? t1.text : src.site_name,
            footer_text: t2.success ? t2.text : src.footer_text,
          };
        })
      );
      setFormData((prev) => ({ ...prev, translations: newTrans }));
      toast.success("Tamamlandı", { id: toastId });
    };

    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* SOL KOLON: SİTE AYARLARI */}
        <div className="card-admin shadow-sm border border-admin-card-border h-fit">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-admin-card-border">
            <h3 className="font-bold text-lg text-[var(--admin-fg)]">
              Site Kimliği ({lang.toUpperCase()})
            </h3>
            <button
              onClick={handleTranslate}
              className="btn-admin btn-admin-secondary text-xs px-3 gap-2"
            >
              <SlRefresh /> Çevir
            </button>
          </div>

          <div className="space-y-6">
            {/* 1. NAVBAR TASARIMI SEÇİMİ (YENİ EKLENEN KISIM) */}
            <div className="bg-[var(--admin-input-bg)] p-4 rounded-xl border border-[var(--admin-card-border)]">
              <label className="admin-label mb-3 block">
                Navigasyon (Header) Tasarımı
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* V1: KLASİK */}
                <div
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      global: { ...p.global, navbar_style: "v1" },
                    }))
                  }
                  className={`cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center gap-2 transition-all ${
                    formData.global.navbar_style === "v1"
                      ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/5"
                      : "border-transparent bg-[var(--admin-bg)] hover:border-[var(--admin-card-border)]"
                  }`}
                >
                  <SlLayers
                    size={24}
                    className={
                      formData.global.navbar_style === "v1"
                        ? "text-[var(--admin-accent)]"
                        : "text-[var(--admin-muted)]"
                    }
                  />
                  <span className="text-xs font-bold text-[var(--admin-fg)]">
                    Klasik (Logo Solda)
                  </span>
                  {/* Görsel Temsil */}
                  <div className="w-full h-8 bg-[var(--admin-card-border)]/30 rounded flex items-center px-2 gap-2 mt-1">
                    <div className="w-4 h-4 bg-[var(--admin-muted)]/50 rounded-full"></div>
                    <div className="w-12 h-2 bg-[var(--admin-muted)]/30 rounded"></div>
                    <div className="ml-auto w-4 h-2 bg-[var(--admin-muted)]/30 rounded"></div>
                  </div>
                </div>

                {/* V2: MEGA MENU */}
                <div
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      global: { ...p.global, navbar_style: "v2" },
                    }))
                  }
                  className={`cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center gap-2 transition-all ${
                    formData.global.navbar_style === "v2"
                      ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/5"
                      : "border-transparent bg-[var(--admin-bg)] hover:border-[var(--admin-card-border)]"
                  }`}
                >
                  <SlGrid
                    size={24}
                    className={
                      formData.global.navbar_style === "v2"
                        ? "text-[var(--admin-accent)]"
                        : "text-[var(--admin-muted)]"
                    }
                  />
                  <span className="text-xs font-bold text-[var(--admin-fg)]">
                    Mega Menü (Logo Üstte)
                  </span>
                  {/* Görsel Temsil */}
                  <div className="w-full mt-1 flex flex-col gap-1">
                    <div className="w-full h-6 bg-[var(--admin-card-border)]/30 rounded flex items-center justify-center">
                      <div className="w-4 h-4 bg-[var(--admin-muted)]/50 rounded-full"></div>
                    </div>
                    <div className="w-full h-3 bg-[var(--admin-muted)]/30 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. DİĞER INPUTLAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="admin-label">Site Başlığı (Title)</label>
                  <input
                    className="admin-input font-bold"
                    value={formData.translations[lang].site_name}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        translations: {
                          ...p.translations,
                          [lang]: {
                            ...p.translations[lang],
                            site_name: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="admin-label">Logo URL</label>
                  <input
                    className="admin-input text-xs"
                    value={formData.global.logo_url}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        global: { ...p.global, logo_url: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="admin-label">Favicon URL</label>
                  <input
                    className="admin-input text-xs"
                    value={formData.global.favicon_url}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        global: { ...p.global, favicon_url: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[var(--admin-input-bg)] rounded-lg h-28 border border-[var(--admin-card-border)] flex items-center justify-center relative group">
                  {formData.global.logo_url ? (
                    <img
                      src={formData.global.logo_url}
                      className="max-h-20 max-w-full object-contain"
                    />
                  ) : (
                    <SlPicture className="text-3xl opacity-20" />
                  )}
                  <span className="absolute bottom-1 right-2 text-[10px] text-admin-muted">
                    Önizleme
                  </span>
                </div>
                <div>
                  <label className="admin-label flex items-center gap-2">
                    <SlNote className="text-[var(--admin-muted)]" /> Footer
                    Metni
                  </label>
                  <textarea
                    className="admin-textarea min-h-[90px]"
                    value={formData.translations[lang].footer_text}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        translations: {
                          ...p.translations,
                          [lang]: {
                            ...p.translations[lang],
                            footer_text: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ KOLON: DUYURU & KATEGORİ AYARLARI */}
        <div className="space-y-6">
          <AnnouncementSettings ref={announcementRef} lang={lang} />
          <CategorySettings ref={categoryRef} />
        </div>
      </div>
    );
  }
);

GeneralSettings.displayName = "GeneralSettings";
