"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// Tip tanımını recursive hale getirdik
type NavItem = {
  label: string;
  href?: string | null;
  children?: NavItem[];
};

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
  // text-foreground/80 hover:text-primary
  buttonClassName = "text-foreground/80 hover:text-primary cursor-pointer flex items-center gap-1 font-medium",
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

  // Ana container
  const containerClass = hoverTrigger
    ? "relative group h-full flex items-center"
    : "relative h-full flex items-center";

  // Ana liste (Level 1)
  // bg-card, border-muted-light/30
  const listBase =
    "absolute top-full mt-0 left-0 bg-card border border-muted-light/30 shadow-lg rounded-md py-2 w-56 transition-all duration-300 z-20";

  const visibilityClass = hoverTrigger
    ? "opacity-0 invisible group-hover:visible group-hover:opacity-100"
    : open
      ? "opacity-100 visible"
      : "opacity-0 invisible";

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
          <li className="px-4 py-2 text-xs text-muted">Yükleniyor...</li>
        )}
        {!loading && error && (
          <li className="px-4 py-2 text-xs text-red-500">{errorLabel}</li>
        )}
        {!loading && !error && items.length === 0 && (
          <li className="px-4 py-2 text-xs text-muted">{emptyLabel}</li>
        )}
        {!loading &&
          !error &&
          items.map((item, index) => (
            <DropdownItem
              key={`${item.label}-${index}`}
              item={item}
              hoverTrigger={hoverTrigger}
              setOpen={setOpen}
            />
          ))}
      </ul>
    </div>
  );
}

// Alt Bileşen
function DropdownItem({
  item,
  hoverTrigger,
  setOpen
}: {
  item: NavItem;
  hoverTrigger: boolean;
  setOpen: (v: boolean) => void
}) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    // hover:bg-background (Kartın üstünde zemin rengiyle kontrast sağlar) veya hover:bg-primary/5
    <li className="relative group/item px-4 py-2 hover:bg-background cursor-pointer transition-colors">
      <div className="flex items-center justify-between w-full">
        {item.href ? (
          <Link
            href={item.href}
            // text-foreground/80 hover:text-primary
            className="text-foreground/80 hover:text-primary block flex-1 font-medium text-sm"
            onClick={() => {
              if (!hoverTrigger && !hasChildren) setOpen(false);
            }}
          >
            {item.label}
          </Link>
        ) : (
          <span className="text-foreground/80 flex-1 font-medium text-sm">{item.label}</span>
        )}

        {/* Alt kategori oku */}
        {hasChildren && (
          <svg
            className="w-2.5 h-2.5 text-muted -mr-2"
            viewBox="0 0 6 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Alt Menü */}
      {hasChildren && (
        <ul className="absolute left-full top-0 ml-0 bg-card border border-muted-light/30 shadow-lg rounded-md py-2 w-56 
                       opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 z-30">
          {item.children!.map((child, idx) => (
            <DropdownItem
              key={`${child.label}-${idx}`}
              item={child}
              hoverTrigger={hoverTrigger}
              setOpen={setOpen}
            />
          ))}
        </ul>
      )}
    </li>
  );
}