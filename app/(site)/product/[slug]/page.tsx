import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

type LocalizationRow = { lang_code: string; name: string; description?: string | null };

export default async function ProductDetailPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const sp = await searchParams;
    const langRaw = sp.lang;
    const lang = Array.isArray(langRaw) ? langRaw[0] : langRaw || "en";

    const supabase = await createSupabaseServerClient();

    const { data: product, error } = await supabase
        .from("products")
        .select(`
      id,
      slug,
      active,
      product_localizations ( lang_code, name, description )
    `)
        .eq("slug", slug)
        .single();

    if (error || !product || product.active === false) {
        notFound();
    }

    const loc: LocalizationRow | null =
        (product.product_localizations ?? []).find((l: any) => l.lang_code === lang) ||
        (product.product_localizations ?? [])[0] ||
        null;

    const name = loc?.name || product.slug;
    const description = loc?.description || "Bu ürün için açıklama bulunmuyor.";

    return (
        <div className="max-w-5xl mx-auto py-12 w-full">
            <h1 className="text-4xl font-bold mb-6">{name}</h1>
            <p className="text-gray-600 mb-8">{description}</p>
            {/* Burada fiyat, stok, varyantlar vs. ekleyebilirsiniz */}
            <div className="border rounded p-6 bg-white/50">
                <p className="text-sm text-gray-500">
                    Ürün slug: <span className="font-mono">{product.slug}</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    ID: <span className="font-mono">{product.id}</span>
                </p>
            </div>
        </div>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return {
        title: `Ürün - ${slug}`,
        description: `${slug} ürün detayları`,
    };
}