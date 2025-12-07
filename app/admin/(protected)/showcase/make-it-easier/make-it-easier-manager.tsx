"use client";

import { useState } from "react";
import MainSectionForm from "./main-section-form";
import SliderSectionForm from "./slider-section-form";
import { IoFlashOutline, IoImagesOutline } from "react-icons/io5";

export default function MakeItEasierManager({ initialSection, initialSlider }: any) {
    const [activeTab, setActiveTab] = useState<"main" | "slider">("main");

    return (
        <div className="space-y-6">
            {/* TABS */}
            <div className="flex space-x-6 border-b" style={{ borderColor: "var(--admin-card-border)" }}>
                <button
                    onClick={() => setActiveTab("main")}
                    className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
                        activeTab === "main" 
                            ? "border-[var(--admin-accent)] text-[var(--admin-accent)]" 
                            : "border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
                    }`}
                >
                    <IoFlashOutline /> 3 Adım (Ana Bölüm)
                </button>
                <button
                    onClick={() => setActiveTab("slider")}
                    className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
                        activeTab === "slider" 
                            ? "border-[var(--admin-accent)] text-[var(--admin-accent)]" 
                            : "border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
                    }`}
                >
                    <IoImagesOutline /> Kampanya Slider
                </button>
            </div>

            {/* CONTENT */}
            <div className="animate-in fade-in">
                {activeTab === "main" ? (
                    <MainSectionForm initialData={initialSection} />
                ) : (
                    <SliderSectionForm initialData={initialSlider} />
                )}
            </div>
        </div>
    );
}