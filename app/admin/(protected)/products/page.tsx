// app/admin/(protected)/products/page.tsx
import { adminSupabase } from "@/lib/supabase/admin";
import ProductListClient from "./product-list-client";
import Link from "next/link";
import { IoAdd } from "react-icons/io5";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    // 1. Ürünleri ve Medyayı Çek
    const { data, error } = await adminSupabase
        .from("products")
        .select(`
      *,
      product_media (image_key, sort_order)
    `)
        .order("id", { ascending: false });

    if (error) console.error("Ürünler çekilemedi:", error);

    // 2. Veriyi Düzleştir (Flatten) - Eski route.ts mantığı
    // product_media dizisinden sort_order: 0 olanı veya ilkini alıp main_image_url yapıyoruz
    const products = (data || []).map((item: any) => {
        // sort_order 0 olanı bul, yoksa ilkini al
        const media = item.product_media?.find((m: any) => m.sort_order === 0) || item.product_media?.[0];

        return {
            ...item,
            main_image_url: media?.image_key || null // URL artık burada
        };
    });

    return (
        <div className="grid gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold" style={{ color: "var(--admin-fg)" }}>
                    Ürünler <span className="text-sm font-normal opacity-60">({products.length})</span>
                </h2>
                <Link
                    href="/admin/products/new"
                    className="btn-admin btn-admin-primary gap-2"
                >
                    <IoAdd size={18} /> Yeni Ürün
                </Link>
            </div>

            <ProductListClient initialProducts={products} />
        </div>
    );
}