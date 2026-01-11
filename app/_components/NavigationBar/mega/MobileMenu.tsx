// app/_components/NavigationBar/MobileMenu.tsx
"use client";

import Link from "next/link";
import { SlClose } from "react-icons/sl";
import { NavItem } from "./types";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  siteName: string;
  categoryTree: NavItem[];
}

export default function MobileMenu({
  isOpen,
  onClose,
  siteName,
  categoryTree,
}: MobileMenuProps) {
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
        {categoryTree.map((cat) => (
          <div key={cat.id} className="space-y-3">
            <Link
              href={cat.href}
              onClick={onClose}
              className="block text-lg font-black text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-zinc-800"
            >
              {cat.label}
            </Link>
            {cat.children && cat.children.length > 0 && (
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
