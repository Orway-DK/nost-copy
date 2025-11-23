"use client";

import React, { useEffect, useRef } from "react";
import "./MarqueeScroller.css";

type MarqueeItem = { label: string };

interface MarqueeScrollerProps {
    items?: MarqueeItem[];
    speedSeconds?: number;
    direction?: "left" | "right";
    pauseOnHover?: boolean;
    uppercase?: boolean;
    dense?: boolean;
    autoResizeShift?: boolean;
    className?: string;
}

export default function MarqueeScroller({
    items = [
        { label: "TESTIMONIALS" },
        { label: "REVIEW" }
    ],
    speedSeconds = 60,
    direction = "left",
    pauseOnHover = false,
    uppercase = true,
    dense = false,
    autoResizeShift = false,
    className = ""
}: MarqueeScrollerProps) {
    const trackRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!autoResizeShift || !trackRef.current) return;
        const el = trackRef.current;
        const total = el.scrollWidth;
        const view = el.parentElement?.clientWidth ?? 0;

        let shift = -50;
        if (total > view * 3.5) shift = -33.333;
        el.style.setProperty("--marq-shift", `${shift}%`);
    }, [autoResizeShift, items]);

    // Duplicate for infinite effect
    const a = items;
    const b = items;

    return (
        <div
            className={[
                "marq-wrapper",
                direction === "right" ? "marq-direction-right" : "",
                pauseOnHover ? "marq-pause-on-hover" : "",
                dense ? "marq-dense" : "",
                className
            ].filter(Boolean).join(" ")}
            style={{ ["--marq-speed" as any]: `${speedSeconds}s` }}
        >
            <div ref={trackRef} className="marq-track items-center">
                <MarqueeGroup items={a} uppercase={uppercase} />
                <MarqueeGroup items={b} uppercase={uppercase} ariaHidden />
            </div>
        </div>
    );
}

function MarqueeGroup({
    items,
    uppercase,
    ariaHidden = false
}: {
    items: MarqueeItem[];
    uppercase: boolean;
    ariaHidden?: boolean;
}) {
    return (
        <div className="marq-group" aria-hidden={ariaHidden || undefined}>
            {items.map((it, i) => {
                const txt = uppercase ? it.label.toUpperCase() : it.label;
                return (
                    <div key={txt + i} className="marq-item">
                        <span className="marq-text">{txt}</span>
                        <span className="marq-bullet" aria-hidden="true">•</span>
                    </div>
                );
            })}
        </div>
    );
}