// app/_components/LandingSlider/_components/Reveal.tsx
"use client";

import React, {
  type ReactNode,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import clsx from "clsx";
import { useIntersectOnce } from "@/app/home/_hooks/useIntersectOnce";

type Direction = "up" | "down" | "left" | "right";

/**
 * Sadece yaygın HTML tag'leriyle sınırlandırıldı
 * (SVG hariç tutuldu, çünkü ref tipi farklı)
 */
type HtmlTagName =
  | "div"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "main"
  | "nav"
  | "span"
  | "p"
  | "ul"
  | "ol"
  | "li"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";

type Props = {
  children: ReactNode;
  as?: HtmlTagName;
  direction?: Direction;
  delayMs?: number;
  durationMs?: number;
  once?: boolean;
} & HTMLAttributes<HTMLElement>;

export default function Reveal({
  children,
  as: Tag = "div",
  direction = "up",
  delayMs = 0,
  durationMs,
  once = true,
  className,
  style,
  ...rest
}: Props) {
  const { ref, visible } = useIntersectOnce<HTMLElement>({ once });

  const mergedStyle: CSSProperties = {
    ...style,
    ["--rv-delay" as any]: `${delayMs}ms`,
    ...(durationMs != null ? { ["--rv-duration" as any]: `${durationMs}ms` } : {}),
  };

  return (
    <Tag
      ref={ref as unknown as React.Ref<any>} // ✅ ref tip uyuşmazlığını çözer
      style={mergedStyle}
      className={clsx(
        "reveal-base",
        direction === "up" && "reveal-up",
        direction === "down" && "reveal-down",
        direction === "left" && "reveal-left",
        direction === "right" && "reveal-right",
        visible && "reveal-visible",
        className
      )}
      {...rest} // ✅ tüm HTML attributeleri (id, onClick, aria-* vs.) taşır
    >
      {children}
    </Tag>
  );
}
