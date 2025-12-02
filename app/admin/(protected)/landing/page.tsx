"use client";

import { useState } from "react";
import SlidesManager from "./_components/SlidesManager";
import HighlightsManager from "./_components/HighlightsManager";
import { IoImages, IoFlash } from "react-icons/io5";

export default function LandingAdminPage() {
    const [activeTab, setActiveTab] = useState<"slides" | "highlights">("slides");

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Landing Page Management</h2>

            {/* TABS */}
            <div className="flex space-x-6 border-b border-admin-border">
                <button
                    onClick={() => setActiveTab("slides")}
                    className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === "slides" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
                        }`}
                >
                    <IoImages /> Hero Slider
                </button>
                <button
                    onClick={() => setActiveTab("highlights")}
                    className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === "highlights" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
                        }`}
                >
                    <IoFlash /> Highlights (Icons)
                </button>
            </div>

            {/* CONTENT */}
            <div className="animate-in fade-in">
                {activeTab === "slides" ? <SlidesManager /> : <HighlightsManager />}
            </div>
        </div>
    );
}