"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { SlUser, SlBasket } from "react-icons/sl";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAppLoading } from "@/components/AppLoadingProvider";
import Dropdown from "./_components/Dropdown";

type CategoryRow = {
  id: number;
  parent_id: number | null;
  slug: string;
  category_translations: { name: string; lang_code: string }[];
};

type ServiceRow = {
  id: number;
  slug: string;
  service_translations: { title: string; lang_code: string }[];
};

// --- DATA FETCHING ---

const fetchCategories = async (lang: string) => {
  const supabase = createSupabaseBrowserClient();
  // Kategorilerde de filtreyi kaldırıp JS tarafında seçmek daha güvenlidir
  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_id, slug, category_translations(name, lang_code)")
    .eq("active", true)
    .order("slug", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CategoryRow[];
};

const fetchServices = async () => {
  const supabase = createSupabaseBrowserClient();
  // DÜZELTME: Dil filtresini kaldırdık. Tüm çevirileri çekiyoruz.
  const { data, error } = await supabase
    .from("services")
    .select("id, slug, service_translations(title, lang_code)")
    .eq("active", true)
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ServiceRow[];
};

const fetchSiteName = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("site_name")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.site_name || "Nost Copy";
};

function useStaticMenu(lang: string) {
  return useMemo(() => {
    const t = (tr: string, en: string, de: string) =>
      lang === "tr" ? tr : lang === "de" ? de : en;

    return [
      { label: t("Anasayfa", "Home", "Startseite"), href: "/" },
      { label: t("Hakkımızda", "About Us", "Über uns"), href: "/about" },
      { label: t("İletişim", "Contact", "Kontakt"), href: "/contact" },
    ];
  }, [lang]);
}

export default function NavigationBar() {
  const { lang } = useLanguage();
  const staticMenu = useStaticMenu(lang);
  const { start, stop } = useAppLoading();
  const [mounted, setMounted] = useState(false);

  // Kategorileri Çek
  const {
    data: categories,
    isLoading: catLoading,
    error: catError,
  } = useSWR(mounted ? "categories-nav" : null, () => fetchCategories(lang), {
    revalidateOnFocus: false,
  });

  // Hizmetleri Çek
  const {
    data: services,
    isLoading: servLoading,
    error: servError,
  } = useSWR(mounted ? "services-nav" : null, fetchServices, {
    revalidateOnFocus: false,
  });

  const { data: siteName = "Nost Copy" } = useSWR("site_name", fetchSiteName, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading kontrolü
  useEffect(() => {
    // Hata varsa veya veri geldiyse yüklemeyi durdur
    if ((catError || categories) && (servError || services)) {
      stop();
    } else if (catLoading || servLoading) {
      start();
    }

    // Cleanup: Component unmount olursa loading'i kapat
    return () => stop();
  }, [catLoading, servLoading, catError, servError, categories, services, start, stop]);

  // --- KATEGORİ AĞACI ---
  const categoryItems = useMemo(() => {
    if (!categories) return [];
    const mapped = categories.map((c) => {
      // Dil yoksa yedeğe düş (Fallback)
      const tr = c.category_translations.find((t) => t.lang_code === lang)
        || c.category_translations.find((t) => t.lang_code === 'tr');

      return {
        id: c.id,
        parentId: c.parent_id,
        label: tr?.name || c.slug,
        href: `/collections/${c.slug}`,
        children: [] as any[],
      };
    });

    // Parent-Child eşlemesi
    const map: Record<number, any> = {};
    mapped.forEach((item) => { map[item.id] = item; });
    const roots: any[] = [];
    mapped.forEach((item) => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children.push(item);
      } else {
        roots.push(item);
      }
    });
    return roots;
  }, [categories, lang]);

  // --- HİZMET LİSTESİ ---
  const serviceItems = useMemo(() => {
    if (!services) return [];
    return services.map(s => {
      // Dil yoksa yedeğe düş (Fallback: Seçili Dil -> İngilizce -> Türkçe -> İlk Bulunan)
      const translation = s.service_translations.find(t => t.lang_code === lang)
        || s.service_translations.find(t => t.lang_code === 'en')
        || s.service_translations.find(t => t.lang_code === 'tr')
        || s.service_translations[0];

      return {
        label: translation?.title || s.slug,
        href: `/services/${s.slug}`
      };
    });
  }, [services, lang]);

  // Labels
  const labels = useMemo(() => {
    const isTr = lang === 'tr';
    const isDe = lang === 'de';
    return {
      categories: isTr ? "Kategoriler" : isDe ? "Kategorien" : "Categories",
      services: isTr ? "Hizmetler" : isDe ? "Dienstleistungen" : "Services",
      empty: isTr ? "Veri Yok" : isDe ? "Keine Daten" : "No Data",
      error: isTr ? "Hata" : isDe ? "Fehler" : "Error"
    }
  }, [lang]);


  if (!mounted) {
    return (
      <div className="w-full flex justify-center">
        <nav className="relative w-full max-w-7xl h-24 flex items-center justify-between font-onest font-semibold">
          <div className="text-3xl font-poppins font-bold text-transparent bg-gray-200 rounded w-32 h-8 animate-pulse"></div>
        </nav>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <nav className="relative w-full max-w-7xl h-24 flex items-center justify-between font-onest font-semibold">
        <div className="text-3xl font-poppins font-bold">
          <Link href="/">{siteName}</Link>
        </div>

        <ul className="flex space-x-8 items-center">
          {staticMenu.map((item, i) => (
            <li key={i} className="text-gray-700 hover:text-blue-500 transition-colors">
              <Link href={item.href!}>{item.label}</Link>
            </li>
          ))}

          <li>
            <Dropdown
              label={labels.services}
              items={serviceItems}
              loading={servLoading}
              error={!!servError}
              emptyLabel={labels.empty}
              errorLabel={labels.error}
            />
          </li>

          <li>
            <Dropdown
              label={labels.categories}
              items={categoryItems}
              loading={catLoading}
              error={!!catError}
              emptyLabel={labels.empty}
              errorLabel={labels.error}
            />
          </li>
        </ul>

        <div className="flex flex-row text-xl gap-4 opacity-0">
          <SlUser className="cursor-pointer" />
          <SlBasket className="cursor-pointer" />
        </div>
      </nav>
    </div>
  );
}