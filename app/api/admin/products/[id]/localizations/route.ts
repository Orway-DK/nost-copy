// app/api/admin/products/[id]/localizations/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET: Çevirileri getir
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  const { data, error } = await admin
    .from("product_localizations")
    .select("*")
    .eq("product_id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST: Çevirileri kaydet (Upsert)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json(); // { localizations: [{ lang_code, name, description, ... }] }

  // Basit yetki kontrolü (cookie üzerinden)
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
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  // Gelen veriyi hazırla: product_id'yi ekle
  const upsertData = body.localizations.map((loc: any) => ({
    product_id: id,
    lang_code: loc.lang_code,
    name: loc.name,
    description: loc.description,
    // Varsa ID'yi koru, yoksa yeni oluşturur
    ...(loc.id ? { id: loc.id } : {}),
  }));

  // conflict: product_id + lang_code (veritabanında unique index olmalı)
  // Eğer index yoksa "id" üzerinden conflict yönetimi yapın veya önce silip sonra ekleyin.
  // Şemanızda: ux_product_localizations_product_lang_idx var (product_id, lang_code).

  // Not: Supabase upsert için onConflict sütunlarını belirtmek gerekebilir.
  // Burada 'product_id, lang_code' benzersiz olduğu varsayılıyor.

  // Ancak id gönderilirse primary key çakışması ile update yapar.
  // En temiz yöntem: Her dil için tek tek upsert veya delete-insert.
  // upsert kullanacağız.

  const { data, error } = await admin
    .from("product_localizations")
    .upsert(upsertData, { onConflict: "product_id, lang_code" })
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, data });
}
