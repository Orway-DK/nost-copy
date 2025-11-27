"use client";

import React from "react";

type SectionHeadingProps = {
    // Full text, e.g. "Amazing Products Are Ready For You"
    text: string;
    // The substring to highlight, e.g. "Products"
    highlight?: string;
    // CSS color for highlighted span, e.g. "var(--e-global-color-primary)" or "#5d45ff"
    highlightColor?: string;
    // Tag for the heading
    as?: keyof JSX.IntrinsicElements; // "h1" | "h2" | "h3" ...
    // Align heading
    align?: "left" | "center" | "right";
    // Optional className for wrapping elementor-like container
    className?: string;
};

export default function SectionHeading({
    text,
    highlight,
    highlightColor = "var(--e-global-color-primary)",
    as = "h2",
    align = "center",
    className = "",
}: SectionHeadingProps) {
    const HeadingTag = as as React.ElementType;

    const idx = highlight ? text.indexOf(highlight) : -1;
    const before = idx >= 0 ? text.slice(0, idx) : text;
    const highlighted = idx >= 0 ? highlight! : "";
    const after = idx >= 0 ? text.slice(idx + highlight!.length) : "";

    return (
        <div
            className={`elementor-widget-heading ${className}`}
            style={{ textAlign: align }}
            data-widget_type="heading.default"
        >
            <div className="elementor-widget-container">
                <HeadingTag className="elementor-heading-title elementor-size-default text-4xl md:text-5xl leading-tight font-semibold">
                    {before}
                    {highlighted && (
                        <span style={{ color: highlightColor }}>{highlighted}</span>
                    )}
                    {after}
                </HeadingTag>
            </div>
        </div>
    );
}