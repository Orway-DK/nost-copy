// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/api/admin/products/route.ts
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

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (
    adminEmails.length > 0 &&
    (!user.email || !adminEmails.includes(user.email))
  ) {
    return { user: null, status: 403 };
  }
  return { user, status: 200 };
}

// POST: Yeni Ürün + Ana Görsel
export async function POST(req: Request) {
  try {
    const auth = await requireAdminUser();
    if (!auth.user)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: auth.status }
      );

    const body = await req.json();
    // description alanı eklendi
    const {
      sku,
      category_slug,
      name,
      description,
      size,
      min_quantity,
      media_base_path,
      active,
      slug,
      main_image_url,
    } = body;

    if (!name || !category_slug) {
      return NextResponse.json(
        { error: "Product name and category are required." },
        { status: 400 }
      );
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // 1. Ürünü Ekle
    const { data: product, error: prodError } = await admin
      .from("products")
      .insert({
        sku: sku || null,
        category_slug,
        name,
        description: description || null, // Veritabanına yazılıyor
        size: size || "35x50",
        min_quantity: min_quantity ?? 20,
        media_base_path: media_base_path || "/public/media/products",
        active: !!active,
        slug: slug || undefined,
      })
      .select()
      .single();

    if (prodError) throw prodError;

    // 2. Medya Ekle
    if (main_image_url && product) {
      await admin.from("product_media").insert({
        product_id: product.id,
        image_key: main_image_url,
        sort_order: 0,
      });
    }

    return NextResponse.json({ ok: true, data: product }, { status: 201 });
  } catch (e: any) {
    console.error("POST Error:", e);
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
  }
}

// GET: Liste
export async function GET() {
  try {
    const auth = await requireAdminUser();
    if (!auth.user)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: auth.status }
      );

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // product_media'yı joinleyerek ilk görseli çekiyoruz
    const { data, error } = await admin
      .from("products")
      // description select'e eklendi
      .select(
        `
                id, name, description, slug, sku, active, category_slug, size,
                product_media (image_key)
            `
      )
      .order("id", { ascending: false });

    if (error) throw error;

    // Veriyi düzleştirip main_image_url alanını oluşturuyoruz
    const products = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      slug: item.slug,
      sku: item.sku,
      active: item.active,
      category_slug: item.category_slug,
      size: item.size,
      // İlk medyanın key'ini (URL'ini) al, yoksa null
      main_image_url: item.product_media?.[0]?.image_key || null,
    }));

    return NextResponse.json({ data: products }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// DELETE: Ürün Sil
export async function DELETE(req: Request) {
  try {
    const auth = await requireAdminUser();
    if (!auth.user)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: auth.status }
      );

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
    const { error } = await admin.from("products").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// PATCH: Ürün Güncelle + Ana Görsel Güncelle
export async function PATCH(req: Request) {
  try {
    const auth = await requireAdminUser();
    if (!auth.user)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: auth.status }
      );

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id)
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );

    const body = await req.json();
    const { main_image_url, ...fields } = body; // Görseli ayır

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // 1. Ürün verilerini güncelle (Eğer varsa)
    const updatePayload: Record<string, any> = {};
    // description listeye eklendi
    const allowedFields = [
      "sku",
      "category_slug",
      "name",
      "description",
      "size",
      "min_quantity",
      "media_base_path",
      "active",
      "slug",
    ];

    allowedFields.forEach((field) => {
      if (field in fields) {
        updatePayload[field] = fields[field];
      }
    });

    let updatedProduct = null;

    if (Object.keys(updatePayload).length > 0) {
      const { data, error } = await admin
        .from("products")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      updatedProduct = data;
    }

    // 2. Ana Görsel Güncellemesi (Varsa)
    if (main_image_url) {
      const { data: existingMedia } = await admin
        .from("product_media")
        .select("id")
        .eq("product_id", id)
        .eq("sort_order", 0)
        .maybeSingle();

      if (existingMedia) {
        await admin
          .from("product_media")
          .update({ image_key: main_image_url })
          .eq("id", existingMedia.id);
      } else {
        await admin.from("product_media").insert({
          product_id: id,
          image_key: main_image_url,
          sort_order: 0,
        });
      }
    }

    // Eğer ürün güncellenmediyse (sadece resim değiştiyse) mevcut veriyi çekip dönelim
    if (!updatedProduct) {
      const { data } = await admin
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      updatedProduct = data;
    }

    return NextResponse.json(
      { ok: true, data: updatedProduct },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("PATCH Error:", e);
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
