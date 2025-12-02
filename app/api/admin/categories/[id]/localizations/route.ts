// app/api/admin/categories/[id]/localizations/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
  const { data, error } = await admin
    .from("category_translations")
    .select("*")
    .eq("category_id", params.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  const upsertData = body.localizations.map((loc: any) => ({
    category_id: params.id,
    lang_code: loc.lang_code,
    name: loc.name,
    description: loc.description,
    ...(loc.id ? { id: loc.id } : {}),
  }));

  const { data, error } = await admin
    .from("category_translations")
    .upsert(upsertData, { onConflict: "category_id, lang_code" })
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}
