"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Language = { code: string; name: string; is_default: boolean };

const FALLBACK_LANGUAGES: Language[] = [
  { code: "tr", name: "Türkçe", is_default: true },
  { code: "en", name: "English", is_default: false },
  { code: "de", name: "Deutsch", is_default: false },
];

const LS_KEY = "app.languages.cache.v1";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 saat

function readCache(): Language[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; data: Language[] };
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    if (!Array.isArray(parsed.data)) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data: Language[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore
  }
}

export default function LanguageDropdown() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [languages, setLanguages] = useState<Language[]>(FALLBACK_LANGUAGES);
  const [loading, setLoading] = useState(true);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  // Dilleri Supabase'ten çek (publishable key ile)
  useEffect(() => {
    let mounted = true;

    (async () => {
      // Önce cache dene
      const cached = readCache();
      if (cached && mounted) {
        setLanguages(cached);
        setLoading(false);
      }

      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("languages")
          .select("code,name,is_default")
          .order("is_default", { ascending: false })
          .order("code", { ascending: true });

        if (error) throw error;

        if (mounted && data && data.length) {
          setLanguages(data);
          setLoading(false);
          writeCache(data);
        } else if (mounted) {
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Geçersiz lang varsa varsayılan dile dön
  useEffect(() => {
    if (!lang) {
      const def = languages.find((l) => l.is_default) || languages[0];
      setLang(def.code);
      return;
    }
    const exists = languages.some((l) => l.code === lang);
    if (!exists) {
      const def = languages.find((l) => l.is_default) || languages[0];
      setLang(def.code);
    }
  }, [lang, languages, setLang]);

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
    if (code !== lang) setLang(code); // Provider cookie / refresh yönetimi içeride
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
          className="absolute right-0 mt-2 w-44 rounded-lg shadow-lg bg-white ring-1 ring-black/5 z-50"
          role="listbox"
          aria-label="Languages"
        >
          <ul className="py-1 max-h-64 overflow-auto">
            {loading && (
              <li className="px-4 py-2 text-xs text-gray-400">
                Loading languages...
              </li>
            )}
            {!loading &&
              languages.map((l) => (
                <li key={l.code}>
                  <button
                    onClick={() => onSelect(l.code)}
                    role="option"
                    aria-selected={lang === l.code}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${lang === l.code
                        ? "font-semibold text-blue-700"
                        : "text-gray-700"
                      }`}
                  >
                    {l.name}
                    {l.is_default && (
                      <span className="ml-2 text-[10px] uppercase text-gray-400">
                        (default)
                      </span>
                    )}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}