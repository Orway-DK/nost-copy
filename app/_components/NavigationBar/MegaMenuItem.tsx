// app/_components/NavigationBar/MegaMenuItem.tsx
"use client";

import Link from "next/link";
import { IoChevronDown } from "react-icons/io5";
import { NavItem, TranslationDictionary } from "./types";
import MegaDropdown from "./MegaDropdown";

interface MegaMenuItemProps {
  item: NavItem;
  isActive: boolean;
  t: TranslationDictionary;
}

export default function MegaMenuItem({ item, isActive, t }: MegaMenuItemProps) {
  const hasSubcategories = item.children && item.children.length > 0;
  const hasProducts =
    item.allPreviewProducts && item.allPreviewProducts.length > 0;

  // Dropdown açılmalı mı?
  const shouldShowDropdown = !!(hasSubcategories || hasProducts);

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
        {shouldShowDropdown && (
          <IoChevronDown
            className="opacity-40 group-hover:opacity-100 group-hover:rotate-180 transition-all"
            size={10}
          />
        )}
      </Link>

      {shouldShowDropdown && (
        <MegaDropdown item={item} hasSubcategories={!!hasSubcategories} t={t} />
      )}
    </div>
  );
}
