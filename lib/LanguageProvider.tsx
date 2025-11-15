"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LangCtx = { lang: string; setLang: (code: string) => void };
const LanguageContext = createContext<LangCtx | null>(null);

export function LanguageProvider({
  children,
  defaultLang = "tr",
}: {
  children: React.ReactNode;
  defaultLang?: string;
}) {
  const [lang, setLangState] = useState(defaultLang);
  const router = useRouter();

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
    if (match?.[1]) {
      const c = decodeURIComponent(match[1]);
      setLangState(c);
      document.documentElement.setAttribute("lang", c);
    } else {
      // İlk yüklemede html lang’i senkron tutalım
      document.documentElement.setAttribute("lang", defaultLang);
    }
  }, [defaultLang]);

  const setLang = (code: string) => {
    setLangState(code); // ✅ React re-render
    document.cookie = `lang=${encodeURIComponent(code)}; path=/; max-age=31536000`;
    document.documentElement.setAttribute("lang", code); // ✅ html lang

    // Eğer server tarafında cookie’ye göre veri çekiyorsanız:
    router.refresh(); // ✅ RSC’leri cookie ile yeniden getirir
  };

  const value = useMemo(() => ({ lang, setLang }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
