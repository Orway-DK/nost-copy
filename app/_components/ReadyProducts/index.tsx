// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/_components/ReadyProducts/index.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import ProductCarousel from "./ProductCarousel";
import SectionHeading from "./SectionHeading";

export default async function ReadyProducts() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: { getAll() { return cookieStore.getAll() }, setAll() { } },
        }
    );

    // DÜZELTME: Artık 'ready_products_showcase_sections' yerine yeni tabloyu sorguluyoruz
    const { data } = await supabase
        .from("homepage_ready_products")
        .select(`
      price_try, price_usd, price_eur, custom_url,
      products (
        name, slug,
        product_media (image_key)
      )
    `)
        .eq("active", true)
        .order("sort_order", { ascending: true });

    if (!data || data.length === 0) return null;

    // Veriyi Carousel'in beklediği formata dönüştür
    const formattedData = data.map((item: any) => ({
        id: item.products.slug,
        name: item.products.name,
        // Görsel yoksa varsayılanı kullan
        image: item.products.product_media?.[0]?.image_key || "/nost.png",
        price: {
            try: item.price_try,
            usd: item.price_usd,
            eur: item.price_eur
        },
        // Custom URL varsa onu kullan, yoksa ürün detayına git
        url: item.custom_url || `/product/${item.products.slug}`
    }));

    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <SectionHeading
                    text="Muhteşem Ürünler Sizin İçin Hazır"
                    highlight="Ürünler"
                />

                <div className="mt-10">
                    <ProductCarousel products={formattedData} />
                </div>
            </div>
        </section>
    );
}