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
  const { icon, order_no, active, translations } = body;
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  await admin
    .from("landing_highlights")
    .update({ icon, order_no, active })
    .eq("id", params.id);

  if (translations) {
    const upsertData = translations.map((t: any) => ({
      highlight_id: params.id,
      lang_code: t.lang_code,
      text: t.text,
      ...(t.id ? { id: t.id } : {}),
    }));
    await admin
      .from("landing_highlight_translations")
      .upsert(upsertData, { onConflict: "highlight_id, lang_code" });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
  await admin.from("landing_highlights").delete().eq("id", params.id);
  return NextResponse.json({ ok: true });
}
