// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/api/admin/products/[id]/variants/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Helper: Auth check
async function checkAuth() {
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  return !!user;
}

// GET: Varyasyonları Listele
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;

  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  const { data, error } = await admin
    .from("product_variants")
    .select(
      `
            *,
            product_prices (
                amount,
                currency
            )
        `
    )
    .eq("product_id", id)
    .order("id", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST: Yeni Varyasyon Ekle
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;

  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // DÜZELTME: 'req' yerine 'request' kullanıldı.
  const body = await request.json();
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  // Attributes jsonb olduğu için obje olarak gelmeli
  const payload = {
    product_id: id,
    material_slug: body.material_slug || null,
    grams: body.grams ? parseInt(body.grams) : null,
    side_code: body.side_code || null,
    lamination: !!body.lamination,
    lamination_type_slug: body.lamination_type_slug || null,
    operations: Array.isArray(body.operations) ? body.operations : [],
    attributes: body.attributes || {},
  };

  const { data, error } = await admin
    .from("product_variants")
    .insert(payload)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}
