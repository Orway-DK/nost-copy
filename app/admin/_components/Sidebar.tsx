// @/admin/(protected)/_components/Sidebar.tsx
"use client";

export default function Sidebar() {
  return (
    <aside className="hidden md:block fixed left-0 top-0 h-screen p-4 w-64 bg-gray-200 shadow-sm shadow-black z-0 overflow-auto mt-8">
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
          <ul>
            <li className="block px-3 py-2 cursor-default">Ayarlar</li>
            <li>
              <a
                href="/admin/settings/general"
                className="block px-6 py-1 rounded hover:bg-gray-700/20"
              >
                0. Genel
              </a>
            </li>
            <li>
              <a
                href="/admin/settings/topband"
                className="block px-6 py-1 rounded hover:bg-gray-700/20"
              >
                1. Üst Band
              </a>
            </li>
            <li>
              <a
                href="/admin/settings/landingCarousel"
                className="block px-6 py-1 rounded hover:bg-gray-700/20"
              >
                2. Resim Slider
              </a>
            </li>
          </ul>
        </ul>
      </nav>
    </aside>
  );
}
