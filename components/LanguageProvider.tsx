"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo
} from "react";

/*
 Backwards compatible context tip:
 - Eski kullanım: lang, setLang
 - Yeni kullanım: lang_code, currency_code, setCurrencyCode vs.
*/
export type LanguageCtx = {
    // Eski (backwards compatible)
    lang: string;
    setLang: (l: string) => void;

    // Yeni snake_case alanlar
    lang_code: string;
    currency_code: string;

    // Ayrıca same-value camelCase (istersen kaldırabilirsin)
    currency: string;

    // Ayarlama fonksiyonları
    setLangCode: (l: string) => void;
    setCurrencyCode: (c: string) => void;
    setCurrency: (c: string) => void;

    // Otomatik para birimi eşleme açık mı?
    autoCurrency: boolean;
    setAutoCurrency: (v: boolean) => void;
};

const default_currency_by_lang: Record<string, string> = {
    tr: "TRY",
    en: "USD",
    de: "EUR"
};

function normalize_lang(raw?: string): string {
    if (!raw) return "tr";
    const two = raw.slice(0, 2).toLowerCase();
    if (["tr", "en", "de"].includes(two)) return two;
    return "en"; // fallback
}

function normalize_currency(raw?: string): string {
    if (!raw) return "";
    const up = raw.toUpperCase();
    if (up === "TL") return "TRY";
    if (["TRY", "USD", "EUR"].includes(up)) return up;
    return "";
}

const LanguageContext = createContext<LanguageCtx>({
    lang: "tr",
    setLang: () => { },
    lang_code: "tr",
    currency_code: "TRY",
    currency: "TRY",
    setLangCode: () => { },
    setCurrencyCode: () => { },
    setCurrency: () => { },
    autoCurrency: true,
    setAutoCurrency: () => { }
});

type Props = { children: React.ReactNode };

export function LanguageProvider({ children }: Props) {
    // Başlangıç dilini cookie’den oku
    const [lang_code, set_lang_code] = useState<string>(() => {
        if (typeof window === "undefined") return "tr";
        const m = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
        return normalize_lang(m ? decodeURIComponent(m[1]) : "tr");
    });

    // Başlangıç para birimini cookie’den oku (yoksa daha sonra otomatik eşlenecek)
    const [currency_code, set_currency_code] = useState<string>(() => {
        if (typeof window === "undefined") return default_currency_by_lang["tr"];
        const m = document.cookie.match(/(?:^|;\s*)currency=([^;]+)/);
        const normalized = normalize_currency(m ? decodeURIComponent(m[1]) : "");
        return normalized || default_currency_by_lang["tr"];
    });

    // Kullanıcı manuel currency seçti mi? Evetse dil değişince override etme.
    const [autoCurrency, setAutoCurrency] = useState<boolean>(() => {
        // Eğer cookie’de currency varsa ve normalize edilebiliyorsa otomatik modu devre dışı bırakabiliriz.
        if (typeof window === "undefined") return true;
        const m = document.cookie.match(/(?:^|;\s*)currency=([^;]+)/);
        return m ? false : true;
    });

    // Eski API ile uyum: lang === lang_code
    const lang = lang_code;
    const currency = currency_code;

    const persistCookie = useCallback((key: string, value: string) => {
        try {
            document.cookie = `${key}=${encodeURIComponent(
                value
            )}; Path=/; Max-Age=${60 * 60 * 24 * 365}`;
        } catch {
            /* no-op */
        }
    }, []);

    const applyDocumentLang = useCallback(
        (l: string) => {
            if (typeof document !== "undefined") {
                document.documentElement.lang = l;
            }
        },
        []
    );

    // Dil set fonksiyonu (eski API uyumlu)
    const setLang = useCallback(
        (l: string) => {
            const normalized = normalize_lang(l);
            set_lang_code(normalized);
            persistCookie("lang", normalized);
            applyDocumentLang(normalized);
            if (autoCurrency) {
                const cur = default_currency_by_lang[normalized] || "USD";
                set_currency_code(cur);
                persistCookie("currency", cur);
            }
        },
        [autoCurrency, applyDocumentLang, persistCookie]
    );

    // Yeni setLangCode (ayrı)
    const setLangCode = useCallback(
        (l: string) => {
            setLang(l);
        },
        [setLang]
    );

    // Para birimi set fonksiyonu (manuel seçince autoCurrency kapat)
    const setCurrencyCode = useCallback(
        (c: string) => {
            const normalized = normalize_currency(c) || c.toUpperCase();
            set_currency_code(normalized);
            persistCookie("currency", normalized);
            setAutoCurrency(false);
        },
        [persistCookie]
    );

    // currency (camelCase) ile snake_case aynı kalsın
    const setCurrency = useCallback(
        (c: string) => {
            setCurrencyCode(c);
        },
        [setCurrencyCode]
    );

    // Dil değişiminde document.lang güncelle
    useEffect(() => {
        applyDocumentLang(lang_code);
    }, [lang_code, applyDocumentLang]);

    // İlk mount’ta autoCurrency açıksa dil ile currency senkronize et
    useEffect(() => {
        if (autoCurrency) {
            const desired = default_currency_by_lang[lang_code] || "USD";
            if (desired !== currency_code) {
                set_currency_code(desired);
                persistCookie("currency", desired);
            }
        }
    }, [autoCurrency, lang_code, currency_code, persistCookie]);

    const value = useMemo<LanguageCtx>(
        () => ({
            lang,
            setLang,
            lang_code,
            currency_code,
            currency,
            setLangCode,
            setCurrencyCode,
            setCurrency,
            autoCurrency,
            setAutoCurrency
        }),
        [
            lang,
            setLang,
            lang_code,
            currency_code,
            currency,
            setLangCode,
            setCurrencyCode,
            setCurrency,
            autoCurrency
        ]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageCtx {
    return useContext(LanguageContext);
}