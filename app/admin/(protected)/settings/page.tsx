"use client";

import React, { useState, useRef } from "react";
import {
  SlSettings,
  SlSocialFacebook,
  SlLink,
  SlGlobe,
  SlCheck,
} from "react-icons/sl";
import { toast } from "react-hot-toast";

// Bileşenler ve Tipler
import { GeneralSettings } from "./_components/GeneralSettings";
import { SocialSettings } from "./_components/SocialSettings";
import { FooterSettings } from "./_components/FooterSettings";
import { SettingsHandle } from "./_components/CategorySettings";

const LANGUAGES = ["tr", "en", "de"] as const;
export type LangCode = (typeof LANGUAGES)[number];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "social" | "footer">(
    "general"
  );
  const [activeLang, setActiveLang] = useState<LangCode>("tr");
  const [saving, setSaving] = useState(false);

  // Alt Bileşen Ref'leri
  const generalRef = useRef<SettingsHandle>(null);
  const socialRef = useRef<SettingsHandle>(null);
  const footerRef = useRef<SettingsHandle>(null);

  // --- GLOBAL KAYDETME ---
  const handleSaveAll = async () => {
    setSaving(true);
    const toastId = toast.loading("Tüm ayarlar kaydediliyor...");

    try {
      // Tüm aktif ref'lerin save metodunu çağırıyoruz
      const promises = [];
      if (generalRef.current) promises.push(generalRef.current.save());
      if (socialRef.current) promises.push(socialRef.current.save());
      if (footerRef.current) promises.push(footerRef.current.save());

      const results = await Promise.all(promises);

      // Hepsi true döndüyse başarılı
      if (results.every((res) => res === true)) {
        toast.success("Başarıyla kaydedildi!", { id: toastId });
      } else {
        toast.error("Bazı ayarlar kaydedilemedi.", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Beklenmedik bir hata oluştu.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: "general", label: "Genel & Görünüm", icon: SlSettings },
    { id: "social", label: "Sosyal Medya", icon: SlSocialFacebook },
    { id: "footer", label: "Footer Linkleri", icon: SlLink },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* HEADER & GLOBAL TOOLS */}
      <div className="shrink-0 mb-4 px-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Site Ayarları</h1>
          <p className="text-admin-muted text-admin-sm">
            Tüm site yapılandırmasını buradan yönetin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* GLOBAL DİL SEÇİCİ */}
          <div className="flex items-center gap-1 bg-admin-card border border-admin-card-border p-1 rounded-lg shadow-sm">
            <span className="text-[10px] font-bold text-admin-muted px-2 flex items-center gap-1 uppercase tracking-wide">
              <SlGlobe /> Dil
            </span>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`
                            h-8 px-3 rounded-md font-bold uppercase text-xs transition-all border flex items-center
                            ${
                              activeLang === lang
                                ? "bg-admin-accent/20 text-white border-transparent shadow-sm"
                                : "bg-admin-input-bg text-admin-muted border-transparent hover:text-admin-fg hover:bg-admin-bg"
                            }
                        `}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* GLOBAL KAYDET BUTONU */}
          <button
            onClick={handleSaveAll}
            disabled={saving}
            // DÜZELTME: 'flex items-center justify-center' eklendi, 'text-center' kaldırıldı (flex varken gereksiz)
            className="btn-admin btn-admin-primary h-10 px-6 gap-2 text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center"
          >
            <SlCheck size={18} />
            {saving ? "Kaydediliyor..." : "Tümünü Kaydet"}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="shrink-0 flex gap-2 border-b border-admin-card-border mb-4 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
                    flex items-center gap-2 px-6 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? "border-admin-accent text-admin-accent bg-admin-accent/5 rounded-t-lg"
                        : "border-transparent text-admin-muted hover:text-admin-fg hover:border-admin-input-border"
                    }
                `}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT (Scrollable) */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar pb-20 relative">
        {/* ÖNEMLİ: Tablar unmount edilmiyor, CSS ile gizleniyor.
             Böylece state ve ref'ler korunuyor.
          */}

        {/* 1. GENEL & KATEGORİ */}
        <div
          className={`${
            activeTab === "general" ? "block" : "hidden"
          } animate-in fade-in zoom-in-95 duration-200`}
        >
          <GeneralSettings ref={generalRef} lang={activeLang} />
        </div>

        {/* 2. SOSYAL MEDYA */}
        <div
          className={`${
            activeTab === "social" ? "block" : "hidden"
          } max-w-4xl animate-in fade-in zoom-in-95 duration-200`}
        >
          <SocialSettings ref={socialRef} />
        </div>

        {/* 3. FOOTER */}
        <div
          className={`${
            activeTab === "footer" ? "block" : "hidden"
          } w-full animate-in fade-in zoom-in-95 duration-200`}
        >
          <FooterSettings ref={footerRef} lang={activeLang} />
        </div>
      </div>
    </div>
  );
}
