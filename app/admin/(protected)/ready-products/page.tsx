// app/admin/(protected)/ready-products/page.tsx
import { adminSupabase } from "@/lib/supabase/admin";
import ReadyProductsList from "./ready-products-list";

export const dynamic = "force-dynamic";

export default async function ReadyProductsPage() {
    const { data } = await adminSupabase
        .from("homepage_ready_products")
        .select(`
        *,
        products (
            id, name, sku,
            product_media (image_key, sort_order)
        )
    `)
        .order("sort_order", { ascending: true });

    // Flatten Data
    const items = (data || []).map((item: any) => {
        const media = item.products?.product_media?.find((m: any) => m.sort_order === 0) || item.products?.product_media?.[0];
        return {
            ...item,
            product_name: item.products?.name || "Bilinmeyen Ürün",
            product_sku: item.products?.sku || "-",
            main_image_url: media?.image_key || null
        };
    });

    return <ReadyProductsList initialItems={items} />;
}