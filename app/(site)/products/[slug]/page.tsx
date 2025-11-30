import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

type LocalizationRow = { lang_code: string; name: string; description?: string | null };
type ProductRow = {
    id: number;
    slug: string;
    active: boolean;
    product_localizations: LocalizationRow[] | null;
};

export default async function ProductsPage({ searchParams }: PageProps) {
    const sp = await searchParams;
    const langRaw = sp.lang;
    const lang = Array.isArray(langRaw) ? langRaw[0] : langRaw || "en";

    const supabase = await createSupabaseServerClient();

    // Temel ürün listesi (aktif olanlar)
    const { data: productsData, error } = await supabase
        .from("products")
        .select(`
      id,
      slug,
      active,
      product_localizations ( lang_code, name, description )
    `)
        .eq("active", true)
        .order("id", { ascending: true });

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-12">
                <h1 className="text-2xl font-semibold text-red-600">
                    Ürünler yüklenirken hata oluştu
                </h1>
                <p className="text-sm mt-2">{error.message}</p>
            </div>
        );
    }

    const products = (productsData ?? []) as ProductRow[];

    const display = products.map(p => {
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
            <h1 className="text-3xl font-bold mb-6">Tüm Ürünler</h1>
            {!display.length && <p className="text-gray-500">Hiç ürün yok.</p>}
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {display.map(p => (
                    <li key={p.slug} className="border rounded p-4 hover:shadow-sm transition-shadow">
                        <Link href={`/product/${p.slug}`} className="font-semibold hover:text-blue-600">
                            {p.name}
                        </Link>
                        {p.description && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-3">{p.description}</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export async function generateMetadata() {
    return {
        title: "Tüm Ürünler",
        description: "NostCopy - Ürün listesi",
    };
}