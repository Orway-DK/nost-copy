import { adminSupabase } from "@/lib/supabase/admin";
import { IoCubeOutline, IoFolderOpenOutline, IoImagesOutline, IoFlashOutline, IoCheckmarkCircleOutline, IoAlertCircleOutline } from "react-icons/io5";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    // Paralel olarak istatistikleri çek
    const [
        { count: productsCount },
        { count: categoriesCount },
        { count: readyCount },
        { count: slidesCount }
    ] = await Promise.all([
        adminSupabase.from("products").select("*", { count: "exact", head: true }),
        adminSupabase.from("categories").select("*", { count: "exact", head: true }),
        adminSupabase.from("homepage_ready_products").select("*", { count: "exact", head: true }),
        adminSupabase.from("landing_slides").select("*", { count: "exact", head: true }),
    ]);

    const stats = [
        { label: "Toplam Ürün", count: productsCount || 0, icon: IoCubeOutline, href: "/admin/products", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { label: "Kategoriler", count: categoriesCount || 0, icon: IoFolderOpenOutline, href: "/admin/categories", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
        { label: "Hazır Ürünler", count: readyCount || 0, icon: IoFlashOutline, href: "/admin/ready-products", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
        { label: "Slider Görselleri", count: slidesCount || 0, icon: IoImagesOutline, href: "/admin/landing", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>Kontrol Paneli</h2>
                <p className="text-sm" style={{ color: "var(--admin-muted)" }}>Sitenizin içerik durumuna genel bakış.</p>
            </div>

            {/* İSTATİSTİK KARTLARI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="card-admin p-6 flex items-center justify-between hover:shadow-md transition-shadow group"
                    >
                        <div>
                            <p className="text-sm font-medium text-[var(--admin-muted)]">{stat.label}</p>
                            <p className="text-3xl font-bold mt-1" style={{ color: "var(--admin-fg)" }}>{stat.count}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon />
                        </div>
                    </Link>
                ))}
            </div>

            {/* SİSTEM DURUMU & HIZLI ERİŞİM */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Sol: Sistem Sağlığı */}
                <div className="card-admin p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--admin-fg)" }}>Sistem Durumu</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-lg border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)]">
                            <div className="p-2 bg-green-100 text-green-600 rounded-full">
                                <IoCheckmarkCircleOutline size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium" style={{ color: "var(--admin-fg)" }}>Veritabanı Bağlantısı</h4>
                                <p className="text-xs text-[var(--admin-muted)]">Supabase bağlantısı aktif ve çalışıyor.</p>
                            </div>
                            <span className="text-xs font-mono bg-green-100 text-green-700 px-2 py-1 rounded">ONLINE</span>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-lg border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)]">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                                <IoImagesOutline size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium" style={{ color: "var(--admin-fg)" }}>Dosya Depolama (Storage)</h4>
                                <p className="text-xs text-[var(--admin-muted)]">Görseller 'public' bucket üzerinden sunuluyor.</p>
                            </div>
                            <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">ACTIVE</span>
                        </div>
                    </div>
                </div>

                {/* Sağ: Ziyaretçi Özeti (Mockup) */}
                <div className="card-admin p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center justify-between" style={{ color: "var(--admin-fg)" }}>
                        Ziyaretçiler
                        <span className="text-xs font-normal px-2 py-1 rounded bg-yellow-100 text-yellow-800">Demo</span>
                    </h3>
                    <div className="space-y-6">
                        <div className="text-center py-6 border-b border-[var(--admin-input-border)]">
                            <span className="text-4xl font-bold block" style={{ color: "var(--admin-accent)" }}>1,240</span>
                            <span className="text-sm text-[var(--admin-muted)]">Toplam Ziyaret (Bu Ay)</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span style={{ color: "var(--admin-muted)" }}>Türkiye</span>
                                <span className="font-medium" style={{ color: "var(--admin-fg)" }}>85%</span>
                            </div>
                            <div className="w-full bg-[var(--admin-input-bg)] h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: '85%' }}></div>
                            </div>

                            <div className="flex justify-between text-sm mt-2">
                                <span style={{ color: "var(--admin-muted)" }}>Almanya</span>
                                <span className="font-medium" style={{ color: "var(--admin-fg)" }}>10%</span>
                            </div>
                            <div className="w-full bg-[var(--admin-input-bg)] h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: '10%' }}></div>
                            </div>
                        </div>

                        <p className="text-xs text-center text-[var(--admin-muted)] mt-4">
                            * Gerçek analitik verisi için Google Analytics veya veritabanı loglaması kurulmalıdır.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}