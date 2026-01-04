// C:\Projeler\nost-copy\app\_components\NavigationBar\MegaNavbar.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import Image from "next/image";
import { SlMenu, SlClose } from "react-icons/sl";
import {
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaChevronRight,
} from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// --- TİP TANIMLARI ---
type ProductPreview = {
  id: number;
  slug: string;
  name: string;
  image_url: string | null;
  price?: number;
};

export type NavItem = {
  id: number;
  label: string;
  href: string;
  image_path?: string | null;
  children?: NavItem[];
  // Alt kategorinin kendi ürünleri
  previewProducts?: ProductPreview[];
  // Ana kategorinin altındaki TÜM ürünlerin karması (En çok satanlar mantığı için)
  allPreviewProducts?: ProductPreview[];
};

// --- DATA FETCHING ---
const fetchCategories = async (lang: string) => {
  const supabase = createSupabaseBrowserClient();

  // Kategorileri ve içindeki ürünleri çekiyoruz
  // Not: Gerçek bir "En çok satanlar" için orders tablosuna join gerekir ama
  // şimdilik ürünleri sort_order veya ID sırasına göre alıyoruz.
  const { data } = await supabase
    .from("categories")
    .select(
      `
      id, parent_id, slug, image_path, sort,
      category_translations(name, lang_code),
      products (
        id, slug, active, category_slug,
        product_localizations(name, lang_code),
        product_media(image_key, sort_order),
        product_variants(product_prices(amount))
      )
    `
    )
    .eq("active", true)
    .eq("products.active", true)
    .order("sort", { ascending: true });

  return (data ?? []) as any[];
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
  const pathname = usePathname();

  const t = useMemo(
    () => ({
      searchPlaceholder:
        lang === "tr" ? "Ürün ara... (Örn: Kartvizit)" : "Search products...",
      login: lang === "tr" ? "Giriş" : "Login",
      cart: lang === "tr" ? "Sepet" : "Cart",
      allProducts: lang === "tr" ? "Tüm Ürünler" : "All Products",
    }),
    [lang]
  );

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const { data: categories } = useSWR(["categories-nav-v4", lang], () =>
    fetchCategories(lang)
  );
  const { data: siteName = "Nost Copy" } = useSWR("site_name", fetchSiteName);

  // Veri İşleme (Transformer)
  const categoryTree = useMemo(() => {
    if (!categories) return [];
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Helper: Ham ürün verisini ProductPreview tipine çevir
    const transformProduct = (p: any): ProductPreview => {
      const pLoc =
        p.product_localizations.find((l: any) => l.lang_code === lang) ||
        p.product_localizations[0];
      let imgUrl = null;
      if (p.product_media && p.product_media.length > 0) {
        const firstMedia = p.product_media.sort(
          (a: any, b: any) => a.sort_order - b.sort_order
        )[0];
        if (firstMedia.image_key) {
          imgUrl = firstMedia.image_key.startsWith("http")
            ? firstMedia.image_key
            : `${projectUrl}/storage/v1/object/public/products/${firstMedia.image_key}`;
        }
      }
      let price = 0;
      if (p.product_variants?.[0]?.product_prices?.[0]?.amount) {
        price = p.product_variants[0].product_prices[0].amount;
      }
      return {
        id: p.id,
        slug: p.slug,
        name: pLoc?.name || p.slug,
        image_url: imgUrl,
        price,
      };
    };

    // 1. Kategorileri Map'le
    const mappedCategories = categories.map((c) => {
      const tr =
        c.category_translations.find((t: any) => t.lang_code === lang) ||
        c.category_translations.find((t: any) => t.lang_code === "tr");

      const products = (c.products || []).map(transformProduct);

      return {
        id: c.id,
        parent_id: c.parent_id,
        label: tr?.name || c.slug,
        href: `/c/${c.slug}`,
        image_path: c.image_path,
        children: [] as NavItem[],
        previewProducts: products, // Sadece bu kategoriye ait ürünler
        allPreviewProducts: [] as ProductPreview[], // Birazdan dolduracağız
      };
    });

    // 2. Ağacı Kur ve "allPreviewProducts"ı doldur
    const lookup = new Map(mappedCategories.map((c) => [c.id, c]));
    const tree: NavItem[] = [];

    mappedCategories.forEach((cat) => {
      if (cat.parent_id === null) {
        // Ana Kategori
        tree.push(cat);
      } else {
        // Alt Kategori
        const parent = lookup.get(cat.parent_id);
        if (parent) {
          parent.children!.push(cat);
        } else {
          tree.push(cat);
        }
      }
    });

    // 3. Ana Kategoriler için "Tüm Ürünler" listesini oluştur
    // (Ana kategorinin kendi ürünleri + alt kategorilerin ürünleri)
    tree.forEach((rootCat) => {
      let aggregated = [...(rootCat.previewProducts || [])];

      // Alt kategorilerin ürünlerini de ekle
      rootCat.children?.forEach((child) => {
        if (child.previewProducts) {
          aggregated = [...aggregated, ...child.previewProducts];
        }
      });

      // ID'ye göre unique yap (aynı ürün tekrar etmesin) ve ilk 8'i al
      const uniqueProducts = Array.from(
        new Map(aggregated.map((item) => [item.id, item])).values()
      );
      rootCat.allPreviewProducts = uniqueProducts.slice(0, 8);
    });

    return tree;
  }, [categories, lang]);

  return (
    <div className="w-full flex flex-col bg-white dark:bg-zinc-950 shadow-sm sticky top-0 z-50 font-sans">
      {/* Header (Logo, Search...) */}
      <div className="border-b border-border/40 bg-white dark:bg-zinc-950 relative z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-6">
          <Link
            href="/home"
            className="text-2xl font-black tracking-tighter text-foreground shrink-0"
          >
            {siteName}
          </Link>
          <div className="hidden lg:flex flex-1 max-w-xl relative">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full h-11 pl-4 pr-12 bg-gray-100 dark:bg-zinc-900 border-none rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm"
            />
            <button className="absolute right-2 top-2 h-7 w-7 bg-white dark:bg-zinc-800 rounded-md flex items-center justify-center text-primary shadow-sm">
              <FaSearch size={14} />
            </button>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              className="lg:hidden text-2xl p-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <SlMenu />
            </button>
            <div className="hidden lg:flex items-center gap-6">
              <Link
                href="/login"
                className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <FaUser size={18} />
                <span className="text-[10px] font-bold uppercase">
                  {t.login}
                </span>
              </Link>
              <Link
                href="/cart"
                className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors relative"
              >
                <div className="relative">
                  <FaShoppingCart size={18} />
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                    0
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase">
                  {t.cart}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800 shadow-sm relative z-40">
        <div className="container mx-auto">
          <nav className="flex items-center justify-center">
            {categoryTree.map((category) => (
              <MegaMenuItem
                key={category.id}
                item={category}
                isActive={
                  pathname === category.href ||
                  pathname.startsWith(category.href + "/")
                }
                t={t}
              />
            ))}
          </nav>
        </div>
      </div>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        siteName={siteName}
        t={t}
        categoryTree={categoryTree}
      />
    </div>
  );
}

// --- MEGA MENU COMPONENT ---
function MegaMenuItem({
  item,
  isActive,
  t,
}: {
  item: NavItem;
  isActive: boolean;
  t: any;
}) {
  const hasChildren = item.children && item.children.length > 0;

  // 'all' = Tüm ürünler sekmesi, number = Alt kategori ID'si
  const [hoveredSubId, setHoveredSubId] = useState<number | "all">("all");

  // Menü kapandığında state'i sıfırlamak için (Opsiyonel, useEffect ile yapılabilir)

  // Hangi ürünlerin gösterileceğini belirle
  let displayProducts: ProductPreview[] = [];
  let activeLabel = item.label; // Sağ taraftaki başlık
  let activeHref = item.href;

  if (hoveredSubId === "all") {
    displayProducts = item.allPreviewProducts || [];
    activeLabel = `Tüm ${item.label} Ürünleri`;
    activeHref = item.href;
  } else {
    const subItem = item.children?.find((c) => c.id === hoveredSubId);
    if (subItem) {
      displayProducts = subItem.previewProducts?.slice(0, 8) || [];
      activeLabel = subItem.label;
      activeHref = subItem.href;
    }
  }

  return (
    <div className="group static">
      <Link
        href={item.href}
        className={`
          flex items-center gap-1.5 px-6 py-4 text-[13px] font-bold uppercase tracking-wide border-b-[3px] transition-all duration-200
          ${
            isActive
              ? "text-primary border-primary bg-primary/5"
              : "text-gray-700 dark:text-gray-300 border-transparent hover:text-primary hover:border-primary/20"
          }
        `}
      >
        {item.label}
        {hasChildren && (
          <IoChevronDown
            className="opacity-40 group-hover:opacity-100 group-hover:rotate-180 transition-all"
            size={10}
          />
        )}
      </Link>

      {hasChildren && (
        <div className="absolute left-0 w-full bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 top-full min-h-[320px]">
          <div className="container mx-auto">
            <div className="flex">
              {/* SOL SIDEBAR */}
              <div className="w-64 border-r border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 py-4 min-h-[320px]">
                <ul className="flex flex-col gap-1 px-3">
                  {/* 1. TÜM ÜRÜNLER SEKMESİ (EN ÜSTTE) */}
                  <li>
                    <Link
                      href={item.href}
                      onMouseEnter={() => setHoveredSubId("all")}
                      className={`
                          flex items-center justify-between px-4 py-2.5 text-sm font-bold rounded-lg transition-all
                          ${
                            hoveredSubId === "all"
                              ? "text-white bg-primary shadow-md shadow-primary/20"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-800"
                          }
                        `}
                    >
                      <span>Tüm {item.label}</span>
                      {hoveredSubId === "all" && <FaChevronRight size={10} />}
                    </Link>
                  </li>

                  {/* 2. ALT KATEGORİLER */}
                  {item.children!.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={child.href}
                        onMouseEnter={() => setHoveredSubId(child.id)}
                        className={`
                          flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-all
                          ${
                            hoveredSubId === child.id
                              ? "text-primary bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800/50"
                          }
                        `}
                      >
                        {child.label}
                        {hoveredSubId === child.id && (
                          <FaChevronRight size={10} />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SAĞ TARAF (GRID) */}
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    {activeLabel}
                    <span className="text-xs font-normal text-muted-foreground bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                      Popüler
                    </span>
                  </h3>
                  <Link
                    href={activeHref}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Tümünü İncele <FaChevronRight size={8} />
                  </Link>
                </div>

                {/* YATAY KART GRID (4 Kolon) */}
                {displayProducts.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {displayProducts.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.slug}`}
                        className="
                            group/card flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 
                            border border-gray-200 dark:border-zinc-800 rounded-lg 
                            hover:border-primary/50 hover:shadow-md transition-all h-20
                        "
                      >
                        {/* Sol: Ufak Resim */}
                        <div className="relative w-14 h-14 shrink-0 rounded-md bg-gray-50 dark:bg-zinc-950 overflow-hidden border border-gray-100 dark:border-zinc-800">
                          {prod.image_url ? (
                            <Image
                              src={prod.image_url}
                              alt={prod.name}
                              fill
                              className="object-cover group-hover/card:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">
                              NO IMG
                            </div>
                          )}
                        </div>

                        {/* Sağ: İsim ve Fiyat */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                          <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover/card:text-primary leading-tight line-clamp-2 transition-colors">
                            {prod.name}
                          </h4>
                          {/* Eğer prod.price undefined ise 0 kabul et, sonra kontrol et */}
                          {(prod.price ?? 0) > 0 && (
                            <span className="text-[10px] font-medium text-gray-500 mt-1">
                              {prod.price} TL
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
                    <FaSearch size={20} className="text-gray-400 mb-2" />
                    <p className="text-sm">
                      Bu kategoride öne çıkan ürün bulunamadı.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- MOBİL MENÜ ---
function MobileMenu({ isOpen, onClose, siteName, t, categoryTree }: any) {
  return (
    <div
      className={`fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col transition-transform duration-300 lg:hidden ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="font-bold text-xl">{siteName}</span>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
          <SlClose />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {categoryTree.map((cat: NavItem) => (
          <div key={cat.id} className="space-y-3">
            <Link
              href={cat.href}
              onClick={onClose}
              className="block text-lg font-black text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-zinc-800"
            >
              {cat.label}
            </Link>
            {cat.children && (
              <div className="grid grid-cols-2 gap-3">
                {cat.children.map((child) => (
                  <Link
                    key={child.id}
                    href={child.href}
                    onClick={onClose}
                    className="flex flex-col gap-2 p-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
                  >
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {child.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
