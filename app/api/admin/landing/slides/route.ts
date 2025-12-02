import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  // Slide ve Çevirileri Join et
  const { data, error } = await admin
    .from("landing_slides")
    .select(
      `
            *,
            landing_slide_translations (*)
        `
    )
    .order("order_no", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { image_link, order_no, active, translations } = body;
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  // 1. Ana Slide'ı oluştur
  const { data: slide, error: slideError } = await admin
    .from("landing_slides")
    .insert({ image_link, order_no, active })
    .select()
    .single();

  if (slideError)
    return NextResponse.json({ error: slideError.message }, { status: 500 });

  // 2. Çevirileri ekle
  if (translations && Array.isArray(translations)) {
    const transData = translations.map((t: any) => ({
      slide_id: slide.id,
      lang_code: t.lang_code,
      title1: t.title1,
      title2: t.title2,
      text: t.text,
      button_link: t.button_link,
      tips: t.tips, // JSON array
    }));

    const { error: transError } = await admin
      .from("landing_slide_translations")
      .insert(transData);
    if (transError) console.error("Trans Error:", transError);
  }

  return NextResponse.json({ ok: true, data: slide });
}
