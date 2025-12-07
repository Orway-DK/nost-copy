// /home/dorukhan/Desktop/NostCopy/nost-copy/app/_components/NavigationBar/NavigationBar.tsx
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

const fetchCategories = async (lang: string) => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_id, slug, category_translations(name, lang_code)")
    .eq("active", true)
    .eq("category_translations.lang_code", lang)
    .order("slug", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CategoryRow[];
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
      {
        label: t("Hizmetler", "Services", "Dienstleistungen"),
        children: [
          { label: t("Baskı", "Printing", "Druck"), href: "/services/printing" },
          { label: t("Tasarım", "Design", "Design"), href: "/services/design" },
          {
            label: t("Paketleme", "Packaging", "Verpackung"),
            href: "/services/packaging",
          },
        ],
      },
    ];
  }, [lang]);
}

export default function NavigationBar() {
  const { lang } = useLanguage();
  const staticMenu = useStaticMenu(lang);
  const { start, stop } = useAppLoading();

  // --- HYDRATION FIX: MOUNTED STATE ---
  const [mounted, setMounted] = useState(false);

  const {
    data: categories,
    isLoading: catLoading,
    error: catError,
  } = useSWR(mounted ? ["categories-nav", lang] : null, () => fetchCategories(lang), {
    revalidateOnFocus: false,
  });

  const { data: siteName = "Nost Copy" } = useSWR("site_name", fetchSiteName, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    setMounted(true); // Component tarayıcıda çalışmaya başlayınca true olur
  }, []);

  useEffect(() => {
    if (catLoading) start();
    else stop();
  }, [catLoading, start, stop]);

  // 3. ADIM: Düz listeyi Parent-Child ağacına dönüştürme mantığı
  const categoryItems = useMemo(() => {
    if (!categories) return [];

    const mapped = categories.map((c) => {
      const tr = c.category_translations.find((t) => t.lang_code === lang);
      return {
        id: c.id,
        parentId: c.parent_id,
        label: tr?.name || c.slug,
        href: `/collections/${c.slug}`,
        children: [] as any[],
      };
    });

    const map: Record<number, any> = {};
    mapped.forEach((item) => {
      map[item.id] = item;
    });

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

  const categoriesLabel =
    lang === "tr"
      ? "Kategoriler"
      : lang === "de"
        ? "Kategorien"
        : "Categories";

  // --- HYDRATION FIX: YÜKLENMEDEN ÖNCE RENDER YOK ---
  if (!mounted) {
    return (
      <div className="w-full flex justify-center">
        <nav className="relative w-full max-w-7xl h-24 flex items-center justify-between font-onest font-semibold">
          {/* Layout shift'i önlemek için boş bir iskelet */}
          <div className="text-3xl font-poppins font-bold text-transparent bg-gray-200 rounded w-32 h-8 animate-pulse"></div>
          <div className="flex space-x-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>)}
          </div>
          <div className="flex gap-4">
            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
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
          {staticMenu.map((item, i) =>
            item.children ? (
              <li key={i}>
                <Dropdown label={item.label} items={item.children} />
              </li>
            ) : (
              <li key={i} className="text-gray-700 hover:text-blue-500 transition-colors">
                <Link href={item.href!}>{item.label}</Link>
              </li>
            )
          )}
          <li>
            <Dropdown
              label={categoriesLabel}
              items={categoryItems}
              loading={catLoading}
              error={!!catError}
              emptyLabel={
                lang === "tr"
                  ? "Kategori Yok"
                  : lang === "de"
                    ? "Keine Kategorie"
                    : "No category"
              }
              errorLabel={
                lang === "tr"
                  ? "Yüklenemedi"
                  : lang === "de"
                    ? "Fehler beim Laden"
                    : "Load failed"
              }
            />
          </li>
        </ul>

        <div className="flex flex-row text-xl gap-4">
          <SlUser className="cursor-pointer" />
          <SlBasket className="cursor-pointer" />
        </div>
      </nav>
    </div>
  );
}