"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

type NavItem = { label: string; href?: string | null };
type DropdownProps = {
  label: string;
  items: NavItem[];
  emptyLabel?: string;
  errorLabel?: string;
  loading?: boolean;
  error?: boolean;
  hoverTrigger?: boolean; // true: group-hover, false: click toggle
  buttonClassName?: string;
};

export default function Dropdown({
  label,
  items,
  emptyLabel = "No items",
  errorLabel = "Load failed",
  loading = false,
  error = false,
  hoverTrigger = true,
  buttonClassName = "text-gray-700 hover:text-blue-500 cursor-pointer flex items-center gap-1",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLUListElement | null>(null);

  // Click trigger için dış tıklama + ESC kapatma
  useEffect(() => {
    if (hoverTrigger || !open) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [hoverTrigger, open]);

  const containerClass = hoverTrigger
    ? "relative group py-8"
    : "relative py-8";

  const listBase =
    "absolute top-full -mt-4 left-0 bg-white border border-gray-200 shadow-lg rounded-md py-2 w-56 transition-all duration-300 z-10";

  const visibilityClass = hoverTrigger
    ? "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
    : open
      ? "opacity-100 pointer-events-auto"
      : "opacity-0 pointer-events-none";

  return (
    <div className={containerClass}>
      <button
        ref={btnRef}
        className={buttonClassName}
        onClick={() => {
          if (!hoverTrigger) setOpen((o) => !o);
        }}
        aria-haspopup="true"
        aria-expanded={hoverTrigger ? undefined : open}
        aria-label={label}
      >
        {label}
        <svg
          className={`w-2.5 h-2.5 transition-transform ${!hoverTrigger && open ? "rotate-180" : ""
            }`}
          viewBox="0 0 10 6"
          aria-hidden="true"
        >
          <path
            d="m1 1 4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <ul
        ref={popRef}
        className={`${listBase} ${visibilityClass}`}
        role="menu"
        aria-label={label}
      >
        {loading && (
          <li className="px-4 py-2 text-xs text-gray-400">Yükleniyor...</li>
        )}
        {!loading && error && (
          <li className="px-4 py-2 text-xs text-red-600">{errorLabel}</li>
        )}
        {!loading && !error && items.length === 0 && (
          <li className="px-4 py-2 text-xs text-gray-400">{emptyLabel}</li>
        )}
        {!loading &&
          !error &&
          items.map((item, index) => (
            <li
              key={`${item.label}-${index}`}
              className="px-4 py-2 whitespace-nowrap"
              role="none"
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-700 hover:text-blue-500 block"
                  role="menuitem"
                  onClick={() => {
                    if (!hoverTrigger) setOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-700">{item.label}</span>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}