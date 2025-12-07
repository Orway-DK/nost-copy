"use client";

import { useState } from "react";
import SlidesManager from "./_components/SlidesManager";
import HighlightsManager from "./_components/HighlightsManager";
import { IoImages, IoFlash } from "react-icons/io5";

export default function LandingPageClient({ initialSlides, initialHighlights }: any) {
    const [activeTab, setActiveTab] = useState<"slides" | "highlights">("slides");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold" style={{ color: "var(--admin-fg)" }}>
                    Landing Page Yönetimi
                </h2>
            </div>

            {/* TABS */}
            <div className="flex space-x-6 border-b" style={{ borderColor: "var(--admin-card-border)" }}>
                <button
                    onClick={() => setActiveTab("slides")}
                    className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === "slides"
                            ? "border-[var(--admin-accent)]"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                    style={{ color: activeTab === "slides" ? "var(--admin-accent)" : "var(--admin-muted)" }}
                >
                    <IoImages /> Hero Slider
                </button>
                <button
                    onClick={() => setActiveTab("highlights")}
                    className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === "highlights"
                            ? "border-[var(--admin-accent)]"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                    style={{ color: activeTab === "highlights" ? "var(--admin-accent)" : "var(--admin-muted)" }}
                >
                    <IoFlash /> Highlights (İkonlar)
                </button>
            </div>

            {/* CONTENT */}
            <div className="animate-in fade-in">
                {activeTab === "slides"
                    ? <SlidesManager initialSlides={initialSlides} />
                    : <HighlightsManager initialItems={initialHighlights} />
                }
            </div>
        </div>
    );
}