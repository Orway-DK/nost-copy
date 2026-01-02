"use client";

import Link from "next/link";
import { IoLanguage } from "react-icons/io5";
import UserProfile from "@/app/admin/(protected)/_components/UserProfile";

export default function AdminNavbar() {
  const handleLanguageChange = (lang: "tr" | "en") => {
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <header
      className="
        w-full flex flex-row justify-between items-center 
        px-4 h-12
        bg-admin-card text-admin-fg border-b border-admin-card-border
        sticky top-0 z-40 transition-colors duration-200
      "
    >
      <h1 className="text-admin-lg font-semibold flex items-center gap-2"></h1>

      {/* SAĞ: Aksiyonlar */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Dil Değiştirici */}
        <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-admin border border-admin-input-border bg-admin-input-bg text-admin-tiny font-bold text-admin-muted">
          <IoLanguage size={14} />
          <button
            onClick={() => handleLanguageChange("tr")}
            className="hover:text-admin-fg hover:underline transition-colors"
          >
            TR
          </button>
          <span className="opacity-30">|</span>
          <button
            onClick={() => handleLanguageChange("en")}
            className="hover:text-admin-fg hover:underline transition-colors"
          >
            EN
          </button>
        </div>

        {/* Profil */}
        <UserProfile />
      </div>
    </header>
  );
}
