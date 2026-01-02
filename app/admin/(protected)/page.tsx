import { adminSupabase } from "@/lib/supabase/admin";
import {
  IoCubeOutline,
  IoFolderOpenOutline,
  IoImagesOutline,
  IoFlashOutline,
  IoCheckmarkCircleOutline,
  IoStatsChart,
  IoGlobeOutline,
} from "react-icons/io5";
import Link from "next/link";
import DashboardTodoList from "./_components/todo/DashboardTodoList";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Paralel veri çekimi (To-Do'lar eklendi)
  const [
    { count: productsCount },
    { count: categoriesCount },
    { count: readyCount },
    { count: slidesCount },
    { data: todos }, // To-Do verisi
  ] = await Promise.all([
    adminSupabase.from("products").select("*", { count: "exact", head: true }),
    adminSupabase
      .from("categories")
      .select("*", { count: "exact", head: true }),
    adminSupabase
      .from("homepage_ready_products")
      .select("*", { count: "exact", head: true }),
    adminSupabase
      .from("landing_slides")
      .select("*", { count: "exact", head: true }),
    adminSupabase
      .from("admin_todos")
      .select("*")
      .order("is_completed", { ascending: true })
      .order("created_at", { ascending: false }),
  ]);

  const stats = [
    {
      label: "Toplam Ürün",
      count: productsCount || 0,
      icon: IoCubeOutline,
      href: "/admin/products",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Kategoriler",
      count: categoriesCount || 0,
      icon: IoFolderOpenOutline,
      href: "/admin/categories",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Hazır Ürünler",
      count: readyCount || 0,
      icon: IoFlashOutline,
      href: "/admin/ready-products",
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Slider Görselleri",
      count: slidesCount || 0,
      icon: IoImagesOutline,
      href: "/admin/landing",
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500 h-full flex-1 overflow-y-auto pr-4">
      {/* Header */}
      <div className="flex flex-row items-center gap-4">
        <h2 className="admin-page-title">Kontrol Paneli</h2>
        <p className="text-[var(--admin-muted)] text-sm">
          Sistem durumuna ve iş listene genel bakış.
        </p>
      </div>

      {/* 1. İSTATİSTİK KARTLARI (Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card-admin p-6 flex items-center justify-between hover:border-[var(--admin-accent)] transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-[var(--admin-muted)]">
                {stat.label}
              </p>
              <p className="text-3xl font-bold mt-2 text-[var(--admin-fg)]">
                {stat.count}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
            >
              <stat.icon />
            </div>
          </Link>
        ))}
      </div>

      {/* 2. ANA BÖLÜM (2 Kolonlu Layout) - Scrollable Content */}
      <div className="">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
          {/* SOL: Sistem Durumu ve Hızlı Grafikler (2 Birim Genişlik) */}
          <div className="xl:col-span-2 space-y-4">
            {/* Sistem Durum Kartı */}
            <div className="card-admin">
              <h3 className="text-lg font-bold mb-4 text-[var(--admin-fg)] flex items-center gap-2">
                <IoStatsChart className="text-[var(--admin-accent)]" /> Sistem
                Durumu
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--admin-input-bg)] border border-[var(--admin-card-border)]">
                  <div className="p-2 bg-green-100 text-green-600 rounded-full dark:bg-green-900/30 dark:text-green-400">
                    <IoCheckmarkCircleOutline size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--admin-fg)]">
                      Veritabanı Bağlantısı
                    </h4>
                    <p className="text-xs text-[var(--admin-muted)]">
                      Supabase bağlantısı aktif ve yanıt veriyor.
                    </p>
                  </div>
                  <span className="badge-admin badge-admin-success">
                    ONLINE
                  </span>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--admin-input-bg)] border border-[var(--admin-card-border)]">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                    <IoGlobeOutline size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--admin-fg)]">
                      Public Site
                    </h4>
                    <p className="text-xs text-[var(--admin-muted)]">
                      Önyüz yayında ve erişilebilir durumda.
                    </p>
                  </div>
                  <span className="badge-admin badge-admin-success">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>

            {/* Ziyaretçi / Analitik Placeholder */}
            <div className="card-admin">
              <h3 className="text-lg font-bold mb-4 text-[var(--admin-fg)]">
                Ziyaretçi Grafiği
              </h3>
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[var(--admin-input-border)] rounded-xl bg-[var(--admin-input-bg)]/50 text-[var(--admin-muted)] text-sm text-center">
                <p>
                  Google Analytics veya Plausible verileri buraya entegre
                  edilecek.
                </p>
              </div>
            </div>
          </div>

          {/* SAĞ: To-Do Listesi (1 Birim Genişlik, Uzun) */}
          <div className="xl:col-span-1 h-full min-h-[500px]">
            <DashboardTodoList initialTodos={todos || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
