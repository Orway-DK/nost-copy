"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Language = { code: string; name: string; is_default: boolean };

export default function Dropdown() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  // Dilleri Supabase'ten çek
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("languages")
          .select("code,name,is_default")
          .order("is_default", { ascending: false })
          .order("code", { ascending: true });

        if (error) throw error;

        const list: Language[] = data ?? [];
        if (!mounted) return;

        setLanguages(
          list.length
            ? list
            : [
              { code: "tr", name: "Türkçe", is_default: true },
              { code: "en", name: "English", is_default: false },
            ]
        );
      } catch {
        if (!mounted) return;
        setLanguages([
          { code: "tr", name: "Türkçe", is_default: true },
          { code: "en", name: "English", is_default: false },
        ]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setIsOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isOpen]);

  const onSelect = (code: string) => {
    setIsOpen(false);
    setLang(code); // Provider içinde cookie/html lang/router.refresh yönetiyorsunuz
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setIsOpen((s) => !s)}
        className="inline-flex items-center gap-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Change language"
      >
        <span>{lang.toUpperCase()}</span>
        <svg className="w-2.5 h-2.5" viewBox="0 0 10 6" aria-hidden="true">
          <path
            d="m1 1 4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={popRef}
          className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg bg-white ring-1 ring-black/5 z-50"
          role="listbox"
          aria-label="Languages"
        >
          <ul className="py-1">
            {languages.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => onSelect(l.code)}
                  role="option"
                  aria-selected={lang === l.code}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${lang === l.code ? "font-semibold text-blue-700" : "text-gray-700"
                    }`}
                >
                  {l.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
