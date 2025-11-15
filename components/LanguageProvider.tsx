// @/components/LanguageProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Ctx = {
    lang: string;
    setLang: (l: string) => void;
};

const LanguageContext = createContext<Ctx>({
    lang: "tr",
    setLang: () => { },
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [langState, setLangState] = useState<string>(() => {
        if (typeof window === "undefined") return "tr";
        const m = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
        return m ? decodeURIComponent(m[1]) : "tr";
    });

    const setLang = (l: string) => {
        setLangState(l);
        try {
            document.cookie = `lang=${encodeURIComponent(l)}; Path=/; Max-Age=${60 * 60 * 24 * 365}`;
            document.documentElement.lang = l;
        } catch {
            /* no-op */
        }
        // Eğer server komponentleri dili cookie'den okuyorsa burada router.refresh() çağırabilirsin.
    };

    useEffect(() => {
        if (typeof document !== "undefined") {
            document.documentElement.lang = langState;
        }
    }, [langState]);

    return (
        <LanguageContext.Provider value={{ lang: langState, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
