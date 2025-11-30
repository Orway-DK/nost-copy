import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function requireUser() {
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
  if (!user) return { user: null };

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (
    adminEmails.length > 0 &&
    (!user.email || !adminEmails.includes(user.email))
  ) {
    return { user: null };
  }

  return { user };
}

// DÜZELTME: 'ReturnType<typeof createClient>' yerine 'any' kullanıldı.
// Bu, "Type 'public' is not assignable to type 'never'" hatasını çözer.
async function getSettingsId(admin: any) {
  const { data, error } = await admin
    .from("site_settings")
    .select("id")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.id as number | string | undefined;
}

export async function GET() {
  try {
    const auth = await requireUser();
    if (!auth.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
    const settingsId = await getSettingsId(admin);
    if (!settingsId) {
      return NextResponse.json({ settingsId: null, links: [] });
    }

    const { data, error } = await admin
      .from("site_social_links")
      .select("*")
      .eq("settings_id", settingsId)
      .order("sort", { ascending: true })
      .order("id", { ascending: true });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ settingsId, links: data || [] });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireUser();
    if (!auth.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, code, url, active, sort } = body as {
      id?: number | string;
      code?: string;
      url?: string | null;
      active?: boolean;
      sort?: number;
    };

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
    const settingsId = await getSettingsId(admin);
    if (!settingsId) {
      return NextResponse.json(
        { error: "Önce site_settings kaydı oluşturun." },
        { status: 400 }
      );
    }

    if (id) {
      // Update by id (partial allowed)
      const updatePayload: Record<string, any> = {};
      if (typeof code === "string") updatePayload.code = code;
      if (typeof url !== "undefined") updatePayload.url = url;
      if (typeof active === "boolean") updatePayload.active = active;
      if (typeof sort === "number") updatePayload.sort = sort;

      if (Object.keys(updatePayload).length === 0) {
        return NextResponse.json(
          { error: "Güncellenecek alan yok." },
          { status: 400 }
        );
      }

      const { data, error } = await admin
        .from("site_social_links")
        .update(updatePayload)
        .eq("id", id)
        .eq("settings_id", settingsId)
        .select("*")
        .single();

      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data });
    } else {
      // Insert or upsert by unique (settings_id, code)
      if (!code || !code.trim()) {
        return NextResponse.json(
          { error: "code zorunludur." },
          { status: 400 }
        );
      }
      const insertPayload = {
        settings_id: settingsId,
        code: code.trim(),
        url: url ?? null,
        active: !!active,
        sort: typeof sort === "number" ? sort : 0,
      };

      const { data, error } = await admin
        .from("site_social_links")
        .upsert(insertPayload, { onConflict: "settings_id,code" })
        .select("*")
        .single();

      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data });
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireUser();
    if (!auth.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "id zorunludur." }, { status: 400 });

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
    const settingsId = await getSettingsId(admin);
    if (!settingsId) {
      return NextResponse.json(
        { error: "site_settings bulunamadı." },
        { status: 400 }
      );
    }

    const { error } = await admin
      .from("site_social_links")
      .delete()
      .eq("id", id)
      .eq("settings_id", settingsId);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
