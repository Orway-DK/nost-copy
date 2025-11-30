import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Desteklenen body tipleri:
 * - application/json  (fetch/JS)
 * - application/x-www-form-urlencoded veya multipart/form-data (normal HTML form)
 *
 * Başarılı olursa 302 redirect /admin ve HttpOnly Supabase cookie’leri set edilir.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  if (!url || !anonKey) {
    return NextResponse.json(
      { error: "Supabase env eksik (URL veya anon key)" },
      { status: 500 }
    );
  }

  // Body parse (JSON veya FormData)
  let email = "";
  let password = "";
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.startsWith("application/json")) {
      const body = await request.json();
      email = body?.email?.toString() || "";
      password = body?.password?.toString() || "";
    } else {
      const form = await request.formData();
      email = form.get("email")?.toString() || "";
      password = form.get("password")?.toString() || "";
    }
  } catch {
    return NextResponse.json({ error: "Body parse hatası" }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email ve parola gerekli." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const pending: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore
          .getAll()
          .map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(all) {
        all.forEach((c) => pending.push(c));
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.session || !data?.user) {
    return NextResponse.json(
      { error: "Geçersiz kimlik bilgileri." },
      { status: 401 }
    );
  }

  // İstersen rol kontrolü:
  // const role = (data.user.user_metadata as any)?.role;
  // if (role !== "admin") {
  //   return NextResponse.json({ error: "Admin yetkisi yok." }, { status: 403 });
  // }

  // Redirect yanıtı
  const redirectUrl = new URL("/admin", request.url);
  const res = NextResponse.redirect(redirectUrl, { status: 302 });

  // Supabase’in oluşturduğu cookie’leri ekle
  pending.forEach(({ name, value, options }) => {
    res.cookies.set(name, value, options);
  });

  return res;
}
