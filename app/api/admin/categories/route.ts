// app/api/admin/categories/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkAuth() {
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  return !!user;
}

export async function GET() {
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  const { data, error } = await admin
    .from("categories")
    .select("*") // description otomatik gelir
    .order("sort", { ascending: true })
    .order("id", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, slug, description, parent_id, active, sort } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Name and Slug are required" },
      { status: 400 }
    );
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  const { data, error } = await admin
    .from("categories")
    .insert({
      name,
      slug,
      description: description || null, // EKLENDİ
      parent_id: parent_id || null,
      active: !!active,
      sort: sort || 0,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}
