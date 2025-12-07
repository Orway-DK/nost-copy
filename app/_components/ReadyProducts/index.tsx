import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import ProductCarousel from "./ProductCarousel";
// SectionHeading'i buradan siliyoruz, çünkü artık ReadyProductsTitle içinde kullanılıyor
// import SectionHeading from "./SectionHeading"; 
import ReadyProductsTitle from "./ready-products-title"; // Yeni bileşeni import et

const getImageUrl = (path: string | null) => {
    if (!path) return "/nost.png";
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`;
};

export default async function ReadyProducts() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: { getAll() { return cookieStore.getAll() }, setAll() { } },
        }
    );

    const { data } = await supabase
        .from("homepage_ready_products")
        .select(`
            price_try, price_usd, price_eur, custom_url,
            products (
                id, name, slug,
                product_media (image_key, sort_order),
                product_localizations (lang_code, name)
            )
        `)
        .eq("active", true)
        .order("sort_order", { ascending: true });

    if (!data || data.length === 0) return null;

    // Veriyi işle: Tüm dilleri bir objede topla
    const formattedData = data.map((item: any) => {
        const prod = item.products;
        
        // Görseli al
        const mediaKey = Array.isArray(prod.product_media) 
            ? (prod.product_media.find((m: any) => m.sort_order === 0)?.image_key || prod.product_media[0]?.image_key)
            : null;

        // İsimleri hazırla: { tr: "...", en: "...", de: "..." }
        const names: Record<string, string> = { 
            tr: prod.name, // Varsayılan (Tablodaki ana isim)
            en: prod.name,
            de: prod.name 
        };

        if (Array.isArray(prod.product_localizations)) {
            prod.product_localizations.forEach((t: any) => {
                if(t.name) names[t.lang_code] = t.name;
            });
        }

        return {
            id: prod.slug,
            names: names,
            image: getImageUrl(mediaKey),
            price: {
                try: item.price_try,
                usd: item.price_usd,
                eur: item.price_eur
            },
            url: item.custom_url || `/product/${prod.slug}`
        };
    });

    return (
        <section className="py-20 bg-background transition-colors">
            <div className="container mx-auto px-4">
                {/* ESKİSİ:
                   <SectionHeading text="Muhteşem Ürünler..." />
                   YENİSİ:
                   Aşağıdaki component Client Side çalışır ve dili algılar.
                */}
                <ReadyProductsTitle />

                <div className="mt-10">
                    <ProductCarousel products={formattedData} />
                </div>
            </div>
        </section>
    );
}