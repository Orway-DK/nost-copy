// app/admin/(protected)/products/[id]/page.tsx
import { adminSupabase } from "@/lib/supabase/admin";
import ProductForm from "./product-form";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailPage(props: PageProps) {
    const params = await props.params;
    const idString = params.id;
    const isNew = idString === "new";
    const productId = isNew ? null : parseInt(idString);

    // 1. Kategoriler
    const categoryQuery = adminSupabase.from("categories").select("slug");

    // 2. Ürün Detayı (Media ile birlikte)
    const productQuery = !isNew && productId
        ? adminSupabase
            .from("products")
            .select(`*, product_media (image_key, sort_order)`)
            .eq("id", productId)
            .single()
        : Promise.resolve({ data: null });

    // 3. Varyasyonlar & Çeviriler
    const variantsQuery = !isNew && productId
        ? adminSupabase.from("product_variants").select("*").eq("product_id", productId).order("id")
        : Promise.resolve({ data: [] });

    const localizationsQuery = !isNew && productId
        ? adminSupabase.from("product_localizations").select("*").eq("product_id", productId)
        : Promise.resolve({ data: [] });

    const [catRes, prodRes, varRes, locRes] = await Promise.all([
        categoryQuery, productQuery, variantsQuery, localizationsQuery
    ]);

    // Veriyi Hazırla: main_image_url'i çıkar
    let initialProduct = null;
    if (prodRes.data) {
        const item = prodRes.data;
        const media = item.product_media?.find((m: any) => m.sort_order === 0) || item.product_media?.[0];
        initialProduct = {
            ...item,
            main_image_url: media?.image_key || null
        };
    }

    return (
        <div className="grid gap-6">
            <h2 className="text-2xl font-semibold" style={{ color: "var(--admin-fg)" }}>
                {isNew ? "Yeni Ürün Ekle" : `Ürün Düzenle #${productId}`}
            </h2>

            <ProductForm
                isNew={isNew}
                categories={catRes.data?.map(c => c.slug) || []}
                initialProduct={initialProduct}
                initialVariants={varRes.data || []}
                initialLocalizations={locRes.data || []}
            />
        </div>
    );
}