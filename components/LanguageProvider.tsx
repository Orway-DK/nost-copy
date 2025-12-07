"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo
} from "react";

export type LanguageCtx = {
    lang: string;
    setLang: (l: string) => void;
    lang_code: string;
    currency_code: string;
    currency: string;
    setLangCode: (l: string) => void;
    setCurrencyCode: (c: string) => void;
    setCurrency: (c: string) => void;
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
    return "en";
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
    // DÜZELTME 1: Başlangıçta sunucu ile eşleşmesi için her zaman "tr" (varsayılan) ile başlatıyoruz.
    // Cookie okuma işini useEffect'e bırakıyoruz.
    const [lang_code, set_lang_code] = useState<string>("tr");

    // DÜZELTME 2: Currency için de aynısı. Başlangıçta varsayılan, sonra cookie.
    const [currency_code, set_currency_code] = useState<string>("TRY");

    const [autoCurrency, setAutoCurrency] = useState<boolean>(true);

    // DÜZELTME 3: Sayfa yüklendiğinde (Client-side) cookie'leri kontrol et ve güncelle
    useEffect(() => {
        // Dil kontrolü
        const mLang = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
        const cookieLang = normalize_lang(mLang ? decodeURIComponent(mLang[1]) : "tr");
        if (cookieLang !== "tr") {
            set_lang_code(cookieLang);
        }

        // Para birimi kontrolü
        const mCurr = document.cookie.match(/(?:^|;\s*)currency=([^;]+)/);
        const cookieCurr = normalize_currency(mCurr ? decodeURIComponent(mCurr[1]) : "");

        if (cookieCurr) {
            set_currency_code(cookieCurr);
            setAutoCurrency(false); // Cookie varsa manuel seçilmiştir
        } else {
            // Cookie yoksa dile göre otomatik ayarla
            set_currency_code(default_currency_by_lang[cookieLang] || "TRY");
            setAutoCurrency(true);
        }
    }, []);

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

    const setLangCode = useCallback(
        (l: string) => {
            setLang(l);
        },
        [setLang]
    );

    const setCurrencyCode = useCallback(
        (c: string) => {
            const normalized = normalize_currency(c) || c.toUpperCase();
            set_currency_code(normalized);
            persistCookie("currency", normalized);
            setAutoCurrency(false);
        },
        [persistCookie]
    );

    const setCurrency = useCallback(
        (c: string) => {
            setCurrencyCode(c);
        },
        [setCurrencyCode]
    );

    useEffect(() => {
        applyDocumentLang(lang_code);
    }, [lang_code, applyDocumentLang]);

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