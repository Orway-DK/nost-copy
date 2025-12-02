import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
  const { data, error } = await admin
    .from("landing_highlights")
    .select(`*, landing_highlight_translations (*)`)
    .order("order_no", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { icon, order_no, active, translations } = body;
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  const { data: hl, error } = await admin
    .from("landing_highlights")
    .insert({ icon, order_no, active })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  if (translations) {
    const tData = translations.map((t: any) => ({
      highlight_id: hl.id,
      lang_code: t.lang_code,
      text: t.text,
    }));
    await admin.from("landing_highlight_translations").insert(tData);
  }

  return NextResponse.json({ ok: true, data: hl });
}
