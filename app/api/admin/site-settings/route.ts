import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-side only

export async function PATCH(req: Request) {
  try {
    // Next.js 15+: cookies() async. Await edilmeli.
    const cookieStore = await cookies();

    // 1) Kullanıcı doğrulama (client cookie'leri ile)
    const supabaseAuth = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
      cookies: {
        // ReadonlyRequestCookies.getAll() -> { name, value, ... }[]
        getAll() {
          return cookieStore
            .getAll()
            .map((c) => ({ name: c.name, value: c.value }));
        },
        // Route Handler içinde request cookie set edemeyeceğimiz için no-op bırakıyoruz.
        setAll() {},
      },
    });

    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // İsteğe bağlı admin kontrolü: .env.local -> ADMIN_EMAILS=admin@example.com,other@example.com
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (
      adminEmails.length > 0 &&
      (!user.email || !adminEmails.includes(user.email))
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2) Body al
    const body = await req.json();
    const payload = {
      site_name: (body.site_name || "").trim(),
      logo_url: body.logo_url || null,
      favicon_url: body.favicon_url || null,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      whatsapp_url: body.whatsapp_url || null,
      working_hours: body.working_hours || null,
      store_location_url: body.store_location_url || null,
    };
    if (!payload.site_name) {
      return NextResponse.json(
        { error: "site_name zorunludur." },
        { status: 400 }
      );
    }

    // 3) Service role ile RLS'i baypas ederek kayıt ekle/güncelle
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    const { data: existing, error: existingErr } = await admin
      .from("site_settings")
      .select("id")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existingErr) {
      return NextResponse.json({ error: existingErr.message }, { status: 500 });
    }

    if (existing) {
      const { data, error } = await admin
        .from("site_settings")
        .update(payload)
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data }, { status: 200 });
    } else {
      const { data, error } = await admin
        .from("site_settings")
        .insert(payload)
        .select("*")
        .single();

      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data }, { status: 201 });
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
