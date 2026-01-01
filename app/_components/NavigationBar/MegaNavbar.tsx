"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import { SlMenu, SlClose } from "react-icons/sl";
import { FaSearch, FaUser, FaShoppingCart } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// --- TİP TANIMLARI ---
type CategoryRow = {
  id: number;
  parent_id: number | null;
  slug: string;
  category_translations: { name: string; lang_code: string }[];
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

// --- DATA FETCHING ---
const fetchCategories = async (lang: string) => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase
    .from("categories")
    .select("id, parent_id, slug, category_translations(name, lang_code)")
    .eq("active", true)
    .order("slug", { ascending: true }); // İsterseniz 'sort_order' sütunu ekleyip ona göre sıralayabilirsiniz
  return (data ?? []) as CategoryRow[];
};

const fetchSiteName = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase
    .from("site_settings")
    .select("site_name")
    .limit(1)
    .maybeSingle();
  return data?.site_name || "Nost Copy";
};

export default function MegaNavbar() {
  const { lang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dil Çevirileri
  const t = useMemo(() => {
    return {
      searchPlaceholder:
        lang === "tr"
          ? "Aradığınız ürünü yazın... (Örn: Kartvizit)"
          : "Search products...",
      login: lang === "tr" ? "Giriş Yap" : "Login",
      cart: lang === "tr" ? "Sepetim" : "My Cart",
      home: lang === "tr" ? "Anasayfa" : "Home",
    };
  }, [lang]);

  // Mobil Scroll Kilidi
  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Veri Çekme (SWR)
  const { data: categories } = useSWR(["categories-nav", lang], () =>
    fetchCategories(lang)
  );
  const { data: siteName = "Nost Copy" } = useSWR("site_name", fetchSiteName);

  // Kategori Ağacı Oluşturma
  const categoryTree = useMemo(() => {
    if (!categories) return [];
    const mappedCategories = categories.map((c) => {
      const tr =
        c.category_translations.find((t) => t.lang_code === lang) ||
        c.category_translations.find((t) => t.lang_code === "tr");
      return {
        id: c.id,
        parent_id: c.parent_id,
        label: tr?.name || c.slug,
        href: `/c/${c.slug}`,
        children: [] as NavItem[],
      };
    });

    const tree: NavItem[] = [];
    const lookup = new Map(mappedCategories.map((c) => [c.id, c]));

    mappedCategories.forEach((cat) => {
      if (cat.parent_id === null) {
        tree.push(cat);
      } else {
        const parent = lookup.get(cat.parent_id);
        if (parent) parent.children!.push(cat);
        else tree.push(cat);
      }
    });
    return tree;
  }, [categories, lang]);

  return (
    <div className="w-full flex flex-col bg-white dark:bg-zinc-950 shadow-sm sticky top-0 z-50 transition-all font-sans">
      {/* --- ÜST SATIR (LOGO - ARAMA - İKONLAR) --- */}
      <div className="border-b border-border/40 relative z-50 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 lg:px-6 h-20 md:h-24 flex items-center justify-between gap-4 md:gap-8">
          {/* 1. Logo */}
          <Link
            href="/home"
            className="text-2xl md:text-3xl font-bold tracking-tight text-primary shrink-0"
          >
            {siteName}
          </Link>

          {/* 2. Arama Çubuğu (Desktop - Daha Geniş ve Belirgin) */}
          <div className="hidden lg:flex flex-1 max-w-3xl relative group">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full h-12 pl-6 pr-14 bg-gray-100 dark:bg-zinc-900 border-2 border-transparent focus:bg-white dark:focus:bg-black focus:border-primary rounded-lg transition-all text-sm font-medium outline-none"
            />
            <button className="absolute right-0 top-0 h-12 w-14 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors bg-transparent">
              <FaSearch size={18} />
            </button>
          </div>

          {/* 3. İkonlar (Sağ Taraf) */}
          <div className="flex items-center gap-6 shrink-0">
            {/* Mobil Menü Butonu */}
            <button
              className="lg:hidden text-2xl text-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <SlMenu />
            </button>

            {/* Desktop İkonlar */}
            <div className="hidden lg:flex items-center gap-6">
              <Link
                href="/login"
                className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors group"
              >
                <FaUser className="text-xl mb-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold uppercase tracking-wide">
                  {t.login}
                </span>
              </Link>
              <Link
                href="/cart"
                className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors group relative"
              >
                <div className="relative">
                  <FaShoppingCart className="text-xl mb-0.5 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">
                    0
                  </span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wide">
                  {t.cart}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* --- ALT SATIR (SADECE KATEGORİLER - MEGA MENU) --- */}
      <div className="hidden lg:block bg-white dark:bg-zinc-950 border-b border-border/40 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] relative z-40">
        <div className="container mx-auto px-0">
          {/* Burada "justify-center" kullanarak menüyü ortaladık. 
                Sola yaslamak istersen "justify-start" yapabilirsin.
                "gap-0" kullanarak bitişik bir menü görünümü sağladık.
            */}
          <nav className="flex items-center justify-start flex-wrap">
            {categoryTree.map((category) => (
              <MegaMenuItem key={category.href} item={category} />
            ))}
          </nav>
        </div>
      </div>

      {/* --- MOBİL MENÜ --- */}
      <div
        className={`fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col pt-8 px-6 transition-all duration-300 lg:hidden ${
          mobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <span className="text-2xl font-bold text-primary">{siteName}</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-3xl text-foreground"
          >
            <SlClose />
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto pb-10">
          {/* Mobil Arama */}
          <div className="relative">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full h-11 pl-4 pr-10 bg-muted/50 border border-border rounded-lg"
            />
            <FaSearch className="absolute right-3 top-3.5 text-muted-foreground" />
          </div>

          {/* Linkler */}
          <Link
            href="/home"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-bold border-b border-border/30 pb-2"
          >
            {t.home}
          </Link>

          {/* Kategoriler */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Kategoriler
            </span>
            {categoryTree.map((cat) => (
              <div key={cat.href} className="flex flex-col gap-2">
                <Link
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-medium text-lg pl-2 border-l-2 border-primary/50"
                >
                  {cat.label}
                </Link>
                {/* Alt Kategoriler Mobil */}
                {cat.children && cat.children.length > 0 && (
                  <div className="pl-6 flex flex-col gap-2 border-l border-border/30 ml-2">
                    {cat.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-sm text-muted-foreground"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MEGA MENÜ ÖĞESİ (İç Component - Güncellenmiş Stil) ---
function MegaMenuItem({ item }: { item: NavItem }) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="group relative">
      <Link
        href={item.href}
        className={`
                    flex items-center gap-1 px-5 py-4 text-[13px] font-bold text-foreground/80 
                    uppercase tracking-wide border-b-[3px] border-transparent 
                    hover:text-primary hover:bg-gray-50 dark:hover:bg-white/5 hover:border-primary transition-all duration-200
                    ${hasChildren ? "group-hover:text-primary" : ""}
                `}
      >
        {item.label}
        {hasChildren && (
          <IoChevronDown
            size={11}
            className="opacity-40 group-hover:opacity-100 transition-opacity mt-[-2px]"
          />
        )}
      </Link>

      {/* MEGA DROPDOWN PANELİ */}
      {hasChildren && (
        <div className="absolute top-full left-0 pt-0 w-[900px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 origin-top-left">
          {/* Panel İçeriği */}
          <div className="bg-white dark:bg-zinc-950 border-t border-b border-r border-l border-gray-200 dark:border-gray-800 shadow-2xl rounded-b-xl rounded-tr-xl p-8 grid grid-cols-4 gap-8 mt-[1px]">
            {item.children!.map((child) => (
              <div key={child.href} className="flex flex-col gap-3">
                {/* Alt Kategori Başlığı */}
                <Link
                  href={child.href}
                  className="font-extrabold text-sm text-gray-900 dark:text-gray-100 hover:text-primary transition-colors flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2"
                >
                  {child.label}
                </Link>

                {/* 3. Seviye Linkler (Varsa) */}
                {child.children && child.children.length > 0 ? (
                  child.children.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all"
                    >
                      {sub.label}
                    </Link>
                  ))
                ) : (
                  /* Alt kategori yoksa görsel doluluk için placeholder veya açıklama olabilir */
                  <span className="text-xs text-muted-foreground/50 italic">
                    Ürünleri inceleyin
                  </span>
                )}
              </div>
            ))}

            {/* "Tümünü Gör" Linki - Sağ Alt Köşe */}
            <div className="col-span-4 mt-2 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800 flex justify-end">
              <Link
                href={item.href}
                className="text-xs font-bold bg-primary/10 text-primary px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              >
                Tüm {item.label} Ürünlerini İncele →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
