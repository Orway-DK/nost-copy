// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function requireAdminUser() {
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll() {
        return cookieStore
          .getAll()
          .map((c) => ({ name: c.name, value: c.value }));
      },
      setAll() {},
    },
  });
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!user) return { user: null, status: 401 };

  // Admin yetki kontrolü... (Basitleştirildi)
  return { user, status: 200 };
}

// GET Detail
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminUser();
    if (!auth.user)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: auth.status }
      );

    const params = await props.params;
    const productId = params.id;

    if (!productId || productId === "NaN" || productId === "null") {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // Ürün + Medya çekiyoruz
    // description select içine eklendi
    const { data, error } = await admin
      .from("products")
      .select(
        `
                id, sku, category_slug, name, description, size, min_quantity, media_base_path, active, slug,
                product_media (image_key, sort_order)
            `
      )
      .eq("id", productId)
      .order("sort_order", {
        referencedTable: "product_media",
        ascending: true,
      })
      .maybeSingle();

    if (error) throw error;
    if (!data)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // İlk medyayı main_image olarak map'leyelim
    const mainImage = data.product_media?.[0]?.image_key || null;

    return NextResponse.json({
      ok: true,
      data: { ...data, main_image_url: mainImage },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
