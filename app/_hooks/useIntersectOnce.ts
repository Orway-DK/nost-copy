"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  once?: boolean;
  threshold?: number | number[];
  rootMargin?: string;
};

export function useIntersectOnce<T extends HTMLElement>({
  once = true,
  threshold = 0.2,
  rootMargin = "0px 0px -10% 0px",
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frozen = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (frozen) return;
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) {
            frozen = true;
            observer.unobserve(el);
          }
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return { ref, visible };
}
