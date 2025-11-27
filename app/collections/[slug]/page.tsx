import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import Link from "next/link";

export default async function CollectionPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    // Next.js yeni API: params ve searchParams Promise
    const { slug } = await params;
    const sp = await searchParams;
    const lang =
        (typeof sp.lang === "string" ? sp.lang : Array.isArray(sp.lang) ? sp.lang[0] : undefined) ||
        "en";

    const supabase = await createSupabaseServerClient();

    // Kategori id al
    const { data: cat, error: catErr } = await supabase
        .from("categories")
        .select("id, slug")
        .eq("slug", slug)
        .single();

    if (catErr || !cat) {
        return (
            <div className="max-w-7xl mx-auto py-12">
                <h1 className="text-2xl font-semibold">Category not found</h1>
            </div>
        );
    }

    // O kategoriye bağlı ürünleri çek: product_category_map -> products
    // Dil bazlı isim için product_localizations join
    const { data: products, error: prodErr } = await supabase
        .from("product_category_map")
        .select(
            `
      product_id,
      products:product_id (
        id, slug, active,
        product_localizations ( lang_code, name )
      )
    `
        )
        .eq("category_id", cat.id);

    if (prodErr) {
        return (
            <div className="max-w-7xl mx-auto py-12">
                <h1 className="text-2xl font-semibold text-red-600">Failed to load products</h1>
            </div>
        );
    }

    const list =
        (products ?? [])
            .map((p: any) => p.products)
            .filter((p: any) => p?.active) || [];

    // Dil bazlı isim seçimi
    const displayItems = list.map((p: any) => {
        const loc = Array.isArray(p.product_localizations)
            ? p.product_localizations.find((l: any) => l.lang_code === lang)
            : null;
        return {
            slug: p.slug as string,
            name: (loc?.name as string) || (p.slug as string),
        };
    });

    return (
        <div className="max-w-7xl mx-auto py-12">
            <h1 className="text-3xl font-bold mb-6">Collection: {slug}</h1>
            {!displayItems.length && <p>No products in this category.</p>}
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {displayItems.map((p) => (
                    <li key={p.slug} className="border rounded p-4">
                        <Link href={`/product/${p.slug}`} className="font-semibold">
                            {p.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}