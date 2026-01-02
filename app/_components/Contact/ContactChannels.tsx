"use client";

import React, { useState, useEffect } from "react";
import {
  FaWhatsapp,
  FaTelegramPlane,
  FaPhoneAlt,
  FaEnvelope,
  FaPaperPlane,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { SlLocationPin } from "react-icons/sl";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// --- TİP TANIMLARI ---
type ContactLocation = {
  id: number;
  title: string;
  address: string;
  phone: string | null;
  email: string | null;
  map_url: string | null;
  lang_code: string;
  is_default: boolean;
};

type SocialLinks = {
  whatsapp: string | null;
  telegram: string | null;
};

type SocialLinkItem = {
  code: string;
  url: string | null;
  active: boolean;
};

const UI_TEXT = {
  tr: {
    form_title: "Bize Ulaşın",
    form_desc: "Projeleriniz için teklif alın veya sorularınızı sorun.",
    lbl_name: "Ad Soyad",
    lbl_email: "E-Posta",
    lbl_message: "Mesajınız",
    btn_send: "Gönder",
    loc_title: "Ofislerimiz",
    loc_desc: "Ziyaret etmek istediğiniz şubeyi seçin.",
    card_wp: "WhatsApp",
    card_wp_desc: "Hızlı mesajlaşma",
    card_tg: "Telegram",
    card_tg_desc: "Kanalımıza katılın",
    card_phone: "Telefon",
    card_phone_desc: "09:00 - 18:00",
    card_mail: "E-Posta",
    card_mail_desc: "Teklif ve öneriler",
    btn_dir: "Yol Tarifi",
  },
  en: {
    form_title: "Contact Us",
    form_desc: "Get a quote or ask questions about your projects.",
    lbl_name: "Full Name",
    lbl_email: "Email",
    lbl_message: "Message",
    btn_send: "Send Message",
    loc_title: "Our Offices",
    loc_desc: "Select the branch you want to visit.",
    card_wp: "WhatsApp",
    card_wp_desc: "Instant messaging",
    card_tg: "Telegram",
    card_tg_desc: "Join our channel",
    card_phone: "Phone",
    card_phone_desc: "09:00 - 18:00",
    card_mail: "Email",
    card_mail_desc: "Offers & suggestions",
    btn_dir: "Get Directions",
  },
  de: {
    form_title: "Kontaktieren Sie uns",
    form_desc: "Holen Sie sich ein Angebot ein.",
    lbl_name: "Vorname Nachname",
    lbl_email: "E-Mail",
    lbl_message: "Ihre Nachricht",
    btn_send: "Senden",
    loc_title: "Unsere Büros",
    loc_desc: "Wählen Sie die Filiale aus.",
    card_wp: "WhatsApp",
    card_wp_desc: "Sofortnachrichten",
    card_tg: "Telegram",
    card_tg_desc: "Kanal beitreten",
    card_phone: "Telefon",
    card_phone_desc: "09:00 - 18:00",
    card_mail: "E-Mail",
    card_mail_desc: "Angebote & Vorschläge",
    btn_dir: "Wegbeschreibung",
  },
};

interface ContactChannelsProps {
  onOpenForm?: () => void;
}

export default function ContactChannels({ onOpenForm }: ContactChannelsProps) {
  const { lang } = useLanguage();
  const t = UI_TEXT[lang as keyof typeof UI_TEXT] || UI_TEXT.tr;

  // State
  const [locations, setLocations] = useState<ContactLocation[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<ContactLocation | null>(null);
  const [socials, setSocials] = useState<SocialLinks>({
    whatsapp: null,
    telegram: null,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // 1. Lokasyonları Çek
      const locPromise = supabase
        .from("contact_locations")
        .select("*")
        .order("id", { ascending: true });

      // 2. Sosyal Medya Linklerini Çek
      const socialPromise = supabase
        .from("site_social_links")
        .select("code, url, active")
        .in("code", ["whatsapp", "telegram"])
        .eq("active", true);

      const [locRes, socialRes] = await Promise.all([
        locPromise,
        socialPromise,
      ]);

      // Lokasyon Mantığı
      if (locRes.data) {
        setLocations(locRes.data);
        // Varsayılan ofis seçimi (Dil bazlı)
        let defaultLoc = locRes.data.find(
          (l: ContactLocation) => l.lang_code === lang && l.is_default
        );
        if (!defaultLoc)
          defaultLoc = locRes.data.find((l: ContactLocation) => l.lang_code === lang);
        if (!defaultLoc && locRes.data.length > 0) defaultLoc = locRes.data[0];

        setSelectedLoc(defaultLoc || null);
      }

      // Sosyal Medya Mantığı
      if (socialRes.data) {
        const socialMap: SocialLinks = { whatsapp: null, telegram: null };
        socialRes.data.forEach((item: SocialLinkItem) => {
          if (item.code === "whatsapp") socialMap.whatsapp = item.url;
          if (item.code === "telegram") socialMap.telegram = item.url;
        });
        setSocials(socialMap);
      }

      setLoading(false);
    }

    fetchData();
  }, [lang]); // Dil değişince lokasyon seçimini yenile

  if (loading)
    return <div className="p-20 text-center opacity-50">Yükleniyor...</div>;
  if (!selectedLoc)
    return <div className="p-20 text-center">İletişim bilgisi bulunamadı.</div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-12 animate-in fade-in zoom-in duration-500">
      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL: İletişim Formu (5/12) */}
        <div className="lg:col-span-5 h-full">
          <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col h-full sticky top-24">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FaPaperPlane className="text-primary" /> {t.form_title}
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                {t.form_desc}
              </p>
            </div>

            <form className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block tracking-wider">
                  {t.lbl_name}
                </label>
                <input
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30"
                  placeholder="Adınız..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block tracking-wider">
                  {t.lbl_email}
                </label>
                <input
                  type="email"
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30"
                  placeholder="mail@example.com"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block tracking-wider">
                  {t.lbl_message}
                </label>
                <textarea
                  className="w-full h-32 p-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-muted-foreground/30"
                  placeholder="..."
                />
              </div>
              <button
                type="button"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {t.btn_send} <FaPaperPlane className="text-sm" />
              </button>
            </form>
          </div>
        </div>

        {/* SAĞ: Lokasyon Seçimi ve Harita (7/12) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* BAŞLIK & SEÇİM BUTONLARI */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <SlLocationPin className="text-primary" /> {t.loc_title}
              </h2>
              <p className="text-muted-foreground text-xs">{t.loc_desc}</p>
            </div>

            {/* Grid Butonlar (Dinamik) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLoc(loc)}
                  className={`
                                flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden
                                ${
                                  selectedLoc.id === loc.id
                                    ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20"
                                    : "bg-background border-border hover:border-primary/50 hover:bg-muted/50"
                                }
                            `}
                >
                  <div
                    className={`mb-2 p-2 rounded-full text-lg ${
                      selectedLoc.id === loc.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:text-primary transition-colors"
                    }`}
                  >
                    <FaMapMarkerAlt />
                  </div>
                  <span
                    className={`font-bold text-sm text-center line-clamp-2 ${
                      selectedLoc.id === loc.id
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {loc.title}
                  </span>
                  {/* Dil Badge'i */}
                  <span className="absolute top-2 right-2 text-[9px] font-bold uppercase opacity-30">
                    {loc.lang_code}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* HARİTA ALANI */}
          <div className="bg-muted/50 rounded-3xl overflow-hidden border border-border/50 relative min-h-[400px]">
            {selectedLoc.map_url ? (
              <iframe
                key={selectedLoc.id} // Key değiştiğinde iframe yenilenir
                src={selectedLoc.map_url}
                className="absolute inset-0 w-full h-full border-0 grayscale-[50%] hover:grayscale-0 transition-all duration-700"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                Harita linki mevcut değil.
              </div>
            )}

            {/* Detay Kartı (Harita Üzerinde) */}
            <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-md p-5 rounded-2xl border border-border/50 shadow-xl animate-in fade-in slide-in-from-bottom-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    {selectedLoc.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md leading-relaxed whitespace-pre-line">
                    {selectedLoc.address}
                  </p>
                  {selectedLoc.phone && (
                    <a
                      href={`tel:${selectedLoc.phone}`}
                      className="text-sm font-bold text-primary hover:underline mt-2 inline-block"
                    >
                      {selectedLoc.phone}
                    </a>
                  )}
                </div>
                {selectedLoc.map_url && (
                  <a
                    href={selectedLoc.map_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto btn-admin btn-admin-primary text-xs h-10 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-transform"
                  >
                    <FaMapMarkerAlt /> {t.btn_dir}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- ALT BÖLÜM: KARTLAR --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* WhatsApp (Global) */}
        <a
          href={socials.whatsapp || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex flex-col items-center justify-center p-6 rounded-3xl bg-card border border-border/50 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 ${
            !socials.whatsapp ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-3 text-2xl text-green-600 group-hover:scale-110 transition-transform">
            <FaWhatsapp />
          </div>
          <h3 className="font-bold text-foreground group-hover:text-green-600 transition-colors">
            {t.card_wp}
          </h3>
          <p className="text-xs text-muted-foreground">{t.card_wp_desc}</p>
        </a>

        {/* Telegram (Global) */}
        <a
          href={socials.telegram || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex flex-col items-center justify-center p-6 rounded-3xl bg-card border border-border/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 ${
            !socials.telegram ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3 text-2xl text-blue-600 group-hover:scale-110 transition-transform">
            <FaTelegramPlane />
          </div>
          <h3 className="font-bold text-foreground group-hover:text-blue-600 transition-colors">
            {t.card_tg}
          </h3>
          <p className="text-xs text-muted-foreground">{t.card_tg_desc}</p>
        </a>

        {/* Phone (Seçili Ofise Göre) */}
        <a
          href={`tel:${selectedLoc.phone || ""}`}
          className="group flex flex-col items-center justify-center p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 text-2xl text-primary group-hover:scale-110 transition-transform">
            <FaPhoneAlt />
          </div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
            {t.card_phone}
          </h3>
          <h4 className="text-sm font-bold text-foreground/80 mt-1">
            {selectedLoc.phone || "-"}
          </h4>
          <p className="text-[10px] text-muted-foreground mt-1">
            {t.card_phone_desc}
          </p>
        </a>

        {/* Mail (Seçili Ofise Göre) */}
        <a
          href={`mailto:${selectedLoc.email || "info@nostcopy.com"}`}
          className="group flex flex-col items-center justify-center p-6 rounded-3xl bg-card border border-border/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3 text-2xl text-purple-600 group-hover:scale-110 transition-transform">
            <FaEnvelope />
          </div>
          <h3 className="font-bold text-foreground group-hover:text-purple-600 transition-colors">
            {t.card_mail}
          </h3>
          <h4 className="text-sm font-bold text-foreground/80 mt-1 truncate max-w-[150px]">
            {selectedLoc.email || "-"}
          </h4>
          <p className="text-[10px] text-muted-foreground mt-1">
            {t.card_mail_desc}
          </p>
        </a>
      </div>
    </div>
  );
}
