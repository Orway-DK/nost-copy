// /components/AppLoadingProvider.tsx
"use client";

import {
    createContext,
    useContext,
    useMemo,
    useState,
    ReactNode,
    useCallback,
    useEffect,
} from "react";

import Image from "next/image";

type Ctx = {
    pending: number;
    start: () => void;
    stop: () => void;
};

const AppLoadingContext = createContext<Ctx | null>(null);

export function AppLoadingProvider({ children }: { children: ReactNode }) {
    const [pending, setPending] = useState(0);

    // 🔹 BAŞLANGIÇTA OVERLAY AÇIK
    const [visible, setVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    const start = useCallback(() => {
        setPending((p) => p + 1);
    }, []);

    const stop = useCallback(() => {
        setPending((p) => Math.max(0, p - 1));
    }, []);

    // pending değiştikçe overlay görünürlüğü ve fade-out animasyonu
    useEffect(() => {
        if (pending > 0) {
            // Herhangi bir component "yükleniyorum" dedi:
            // Overlay açık ve opak olsun
            setVisible(true);
            setFadeOut(false);
        } else if (pending === 0 && visible) {
            // Yükleme bitti → fade-out başlat
            setFadeOut(true);

            const timeout = setTimeout(() => {
                setVisible(false);
                setFadeOut(false);
            }, 400); // ⏱ CSS transition süresi ile aynı

            return () => clearTimeout(timeout);
        }
    }, [pending, visible]);

    const value = useMemo(
        () => ({ pending, start, stop }),
        [pending, start, stop]
    );

    return (
        <AppLoadingContext.Provider value={value}>
            {/* Overlay: sadece visible=true iken DOM'da */}
            {visible && (
                <div
                    className={`
            fixed inset-0 z-[9999] flex items-center justify-center
            bg-white backdrop-blur-sm
            transition-opacity duration-400
            ${fadeOut ? "opacity-0" : "opacity-100"}
          `}
                >
                    <div className="flex flex-col items-center gap-4">
                        <Image src={"/nost.png"} alt="logo" width={100} height={100} className="spin-slow" />
                    </div>
                </div>
            )}

            {children}
        </AppLoadingContext.Provider>
    );
}

export function useAppLoading() {
    const ctx = useContext(AppLoadingContext);
    if (!ctx) {
        throw new Error("useAppLoading must be used within AppLoadingProvider");
    }
    return ctx;
}
