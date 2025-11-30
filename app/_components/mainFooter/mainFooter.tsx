"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { useLanguage } from "@/components/LanguageProvider";
import FooterInfoArea from "./FooterInfoArea";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MainFooter() {
    const { lang } = useLanguage();

    const [mailAddress, setMailAddress] = useState("");
    const [status, setStatus] = useState<
        "idle" | "loading" | "success" | "error" | "exists"
    >("idle");
    const [message, setMessage] = useState("");
    const resetTimerRef = useRef<number | null>(null);

    const isEmailValid = (email: string) => {
        const trimmed = email.trim().toLowerCase();
        if (trimmed.length > 254) return false;
        return EMAIL_REGEX.test(trimmed);
    };

    async function handleSubscribe() {
        if (status === "loading") return;
        if (!isEmailValid(mailAddress)) {
            setStatus("error");
            setMessage("Please enter a valid email address.");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: mailAddress.trim().toLowerCase(),
                    locale: lang,
                    source: "footer"
                })
            });

            const data = await res.json();
            if (res.ok && data.ok) {
                if (data.already) {
                    setStatus("exists");
                    setMessage(data.message || "Already subscribed.");
                    // Input'u temizlemiyoruz; kullanıcı tekrar denemek isteyebilir
                } else {
                    setStatus("success");
                    setMessage(data.message || "Subscribed successfully.");
                    setMailAddress(""); // başarıyla kaydedildiğinde temizle
                }
            } else {
                setStatus("error");
                setMessage(data.error || "Subscription failed.");
            }
        } catch {
            setStatus("error");
            setMessage("Network error.");
        }
    }

    // Success / exists durumundan belirli süre sonra otomatik geri dönüş
    useEffect(() => {
        if (status === "success" || status === "exists") {
            if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
            resetTimerRef.current = window.setTimeout(() => {
                setStatus("idle");
                setMessage("");
            }, 4000); // 4 saniye sonra geri dön
        }
        return () => {
            if (resetTimerRef.current) {
                window.clearTimeout(resetTimerRef.current);
            }
        };
    }, [status]);

    // Enter tuşu ile form gönderimi
    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubscribe();
        }
    }

    // Buton stili durumlara göre
    const buttonStyleMap: Record<typeof status, string> = {
        idle: "bg-red-500 hover:bg-red-600 active:bg-red-700",
        loading: "bg-gray-400 cursor-wait",
        success: "bg-green-500 hover:bg-green-600 active:bg-green-700",
        error: "bg-red-500 hover:bg-red-600 active:bg-red-700",
        exists: "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-black"
    };

    const buttonLabelMap: Record<typeof status, string> = {
        idle: "Subscribe",
        loading: "Please wait...",
        success: "Subscribed!",
        error: "Retry",
        exists: "Already subscribed"
    };

    return (
        <>
            <div className="mt-10 w-full overflow-hidden">
                {/* Üst kıvrım */}
                <div className="block border-none rotate-180 w-full overflow-hidden">
                    <svg
                        className="bg-[#212529] h-[90px] w-[calc(100%+2px)]"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1000 100"
                        preserveAspectRatio="none"
                    >
                        <path
                            className="fill-[#ecf2ff]"
                            d="M500,97C126.7,96.3,0.8,19.8,0,0v100l1000,0V1C1000,19.4,873.3,97.8,500,97z"
                        ></path>
                    </svg>
                </div>

                <div className="flex items-center justify-center bg-[#212529]">
                    <div className="flex flex-col md:flex-row w-full max-w-7xl text-[#ecf2ff] items-center justify-between gap-6">
                        <div className="text-3xl md:text-5xl max-w-lg font-bold text-center md:text-left flex-1 leading-16">
                            Sign Up For Exclusive Offers From Us
                        </div>
                        <div className="flex flex-col md:flex-row items-center flex-1 justify-end w-full">
                            <input
                                type="email"
                                className={`w-full md:w-auto bg-white text-black px-5 py-3 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${status === "success"
                                    ? "border border-green-400"
                                    : status === "error"
                                        ? "border border-red-400"
                                        : "border border-transparent"
                                    }`}
                                placeholder="your@email.com"
                                value={mailAddress}
                                onChange={(e) => setMailAddress(e.target.value)}
                                onKeyDown={onKeyDown}
                                aria-label="Email address"
                                disabled={status === "loading"}
                            />
                            <button
                                className={`px-6 py-3 border rounded-r-full font-medium transition text-white ${buttonStyleMap[status]}`}
                                disabled={status === "loading"}
                                onClick={handleSubscribe}
                                aria-live="polite"
                            >
                                {buttonLabelMap[status]}
                            </button>
                        </div>
                    </div>
                </div>

                {status !== "idle" && message && (
                    <div className="flex justify-center mb-6">
                        <div
                            className={`text-sm px-4 py-2 rounded-r-full shadow-sm ${status === "success"
                                ? "bg-green-100 text-green-700"
                                : status === "exists"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : status === "error"
                                        ? "bg-red-100 text-red-600"
                                        : status === "loading"
                                            ? "bg-gray-100 text-gray-700"
                                            : "bg-gray-100 text-gray-700"
                                }`}
                            role="status"
                            aria-live="polite"
                        >
                            {message}
                        </div>
                    </div>
                )}
            </div>

            <FooterInfoArea />
        </>
    );
}