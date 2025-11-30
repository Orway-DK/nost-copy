import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

type LocalizationRow = {
    lang_code: string;
    name: string;
    description?: string | null;
};

type ProductRow = {
    id: number;
    slug: string;
    active: boolean;
    product_localizations: LocalizationRow[] | null;
};

export default async function CollectionPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const sp = await searchParams;
    const langRaw = sp.lang;
    const lang = Array.isArray(langRaw) ? langRaw[0] : langRaw || "en";

    const supabase = await createSupabaseServerClient();

    // 1. Kategori
    const { data: category, error: catErr } = await supabase
        .from("categories")
        .select("id, slug, active, name")
        .eq("slug", slug)
        .single();

    if (catErr || !category || category.active === false) {
        notFound();
    }

    // 2. Mapping product_ids
    const { data: mapRows, error: mapErr } = await supabase
        .from("product_category_map")
        .select("product_id")
        .eq("category_slug", slug);

    if (mapErr) {
        return (
            <div className="max-w-7xl mx-auto py-12">
                <h1 className="text-2xl font-semibold text-red-600">Kategori eşleme okunamadı</h1>
                <p className="text-sm mt-2">{mapErr.message}</p>
            </div>
        );
    }

    const mappedIds = (mapRows ?? []).map(r => r.product_id);
    const uniqueIds = new Set<number>(mappedIds);

    // 3a. Primary kategori ürünleri
    const { data: primaryProducts, error: primErr } = await supabase
        .from("products")
        .select(`
      id,
      slug,
      active,
      product_localizations ( lang_code, name, description )
    `)
        .eq("category_slug", slug);

    if (primErr) {
        return (
            <div className="max-w-7xl mx-auto py-12">
                <h1 className="text-2xl font-semibold text-red-600">Primary ürünler okunamadı</h1>
                <p className="text-sm mt-2">{primErr.message}</p>
            </div>
        );
    }

    primaryProducts?.forEach(p => uniqueIds.add(p.id));

    // 3b. Tüm birleştirilmiş ürünleri ID üzerinden tekrar çek (duplicate temiz)
    let mappedProducts: ProductRow[] = [];
    if (uniqueIds.size > 0) {
        const { data: mappedData, error: mappedErr } = await supabase
            .from("products")
            .select(`
        id,
        slug,
        active,
        product_localizations ( lang_code, name, description )
      `)
            .in("id", Array.from(uniqueIds));

        if (mappedErr) {
            return (
                <div className="max-w-7xl mx-auto py-12">
                    <h1 className="text-2xl font-semibold text-red-600">Ürünler yüklenirken hata oluştu</h1>
                    <p className="text-sm mt-2">{mappedErr.message}</p>
                </div>
            );
        }

        mappedProducts = (mappedData ?? []) as ProductRow[];
    }

    const activeProducts = mappedProducts.filter(p => p.active);

    const displayItems = activeProducts.map(p => {
        const loc =
            p.product_localizations?.find(l => l.lang_code === lang) ||
            p.product_localizations?.[0] ||
            null;
        return {
            slug: p.slug,
            name: loc?.name || p.slug,
            description: loc?.description || null,
        };
    });

    return (
        <div className="max-w-7xl mx-auto py-12 w-full">
            <h1 className="text-3xl font-bold mb-6">
                Koleksiyon: {category.name || category.slug}
            </h1>
            {!displayItems.length && (
                <p className="text-gray-500">Bu kategoride ürün bulunmuyor.</p>
            )}
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {displayItems.map(p => (
                    <li
                        key={p.slug}
                        className="border rounded p-4 hover:shadow-sm transition-shadow"
                    >
                        <Link
                            href={`/product/${p.slug}`}
                            className="font-semibold hover:text-blue-600"
                        >
                            {p.name}
                        </Link>
                        {p.description && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                                {p.description}
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return {
        title: `Collection - ${slug}`,
        description: `Products in ${slug} collection`,
    };
}