import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const body = await req.json();
  const { image_link, order_no, active, translations } = body;
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  // 1. Ana Slide Güncelle
  await admin
    .from("landing_slides")
    .update({ image_link, order_no, active })
    .eq("id", params.id);

  // 2. Çevirileri Güncelle (Upsert)
  if (translations && Array.isArray(translations)) {
    const upsertData = translations.map((t: any) => ({
      slide_id: params.id,
      lang_code: t.lang_code,
      title1: t.title1,
      title2: t.title2,
      text: t.text,
      button_link: t.button_link,
      tips: t.tips,
      ...(t.id ? { id: t.id } : {}), // ID varsa update, yoksa insert
    }));

    await admin
      .from("landing_slide_translations")
      .upsert(upsertData, { onConflict: "slide_id, lang_code" });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  // Cascade delete olduğu için translations otomatik silinir
  const { error } = await admin
    .from("landing_slides")
    .delete()
    .eq("id", params.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
