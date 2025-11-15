// @/admin/(protected)/_components/Sidebar.tsx
"use client";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  return (
    <aside className="hidden md:block sticky top-0 min-h-screen p-4 min-w-64 w-64">
      <h2 className="text-2xl font-semibold mb-6">Admin Paneli</h2>
      <nav className="space-y-4">
        <ul>
          <li>
            <a
              href="/admin"
              className="block px-3 py-2 rounded hover:bg-gray-700/20"
            >
              Ana Sayfa
            </a>
          </li>
          <a
            href="/admin/users"
            className="block px-3 py-2 rounded hover:bg-gray-700/20"
          >
            Kullanıcılar
          </a>
          <ul>
            <li className="block px-3 py-2">Ayarlar</li>
            <li>
              <a
                href="/admin/settings/general"
                className="block px-6 py-1 rounded hover:bg-gray-700/20"
              >
                Genel
              </a>
            </li>
            <li>
              <a
                href="/admin/settings/topband"
                className="block px-6 py-1 rounded hover:bg-gray-700/20"
              >
                Üst Band
              </a>
            </li>
          </ul>
        </ul>
      </nav>
    </aside>
  );
}
