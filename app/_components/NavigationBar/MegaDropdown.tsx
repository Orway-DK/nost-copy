// app/_components/NavigationBar/MegaDropdown.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { FaChevronRight, FaSearch } from "react-icons/fa";
import { NavItem, ProductPreview, TranslationDictionary } from "./types";
import ProductCard from "./ProductCard";

interface MegaDropdownProps {
  item: NavItem;
  hasSubcategories: boolean;
  t: TranslationDictionary;
}

export default function MegaDropdown({
  item,
  hasSubcategories,
  t,
}: MegaDropdownProps) {
  const [hoveredSubId, setHoveredSubId] = useState<number | "all">("all");

  let displayProducts: ProductPreview[] = [];
  let activeLabel = item.label;
  let activeHref = item.href;

  // VERİ SEÇİMİ MANTIĞI
  if (hasSubcategories) {
    // 1. Durum: Sidebar Var
    if (hoveredSubId === "all") {
      displayProducts = item.allPreviewProducts || [];
      activeLabel = `Tüm ${item.label} Ürünleri`;
    } else {
      const subItem = item.children?.find((c) => c.id === hoveredSubId);
      if (subItem) {
        displayProducts = subItem.previewProducts?.slice(0, 8) || [];
        activeLabel = subItem.label;
        activeHref = subItem.href;
      }
    }
  } else {
    // 2. Durum: Sidebar Yok (Direkt Ana Kategorideki Ürünler)
    displayProducts = item.allPreviewProducts || [];
    activeLabel = `${item.label} Modelleri`;
  }

  return (
    <div className="absolute left-0 w-full bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 top-full min-h-[320px]">
      <div className="container mx-auto">
        <div className="flex h-full min-h-[320px]">
          {/* --- SOL SIDEBAR --- */}
          {hasSubcategories && (
            <div className="w-64 border-r border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 py-4 shrink-0">
              <ul className="flex flex-col gap-1 px-3">
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
          )}

          {/* --- SAĞ TARAF (GRID) --- */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                {activeLabel}
                {displayProducts.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    Öne Çıkanlar
                  </span>
                )}
              </h3>
              <Link
                href={activeHref}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                Tümünü İncele <FaChevronRight size={8} />
              </Link>
            </div>

            {displayProducts.length > 0 ? (
              <div
                className={`grid gap-4 ${
                  hasSubcategories ? "grid-cols-4" : "grid-cols-5"
                }`}
              >
                {/* Sidebar yoksa daha geniş olduğu için 5 kolon yapabiliriz */}
                {displayProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
                <FaSearch size={20} className="text-gray-400 mb-2" />
                <p className="text-sm">
                  Bu kategoride henüz öne çıkan ürün bulunamadı.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
