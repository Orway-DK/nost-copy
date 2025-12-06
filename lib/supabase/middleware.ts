import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // 1. Varsayılan response oluştur (Cookie'leri taşımak için gerekli)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Supabase istemcisini oluştur
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Cookie'leri hem request'e hem response'a işle (Kritik nokta burası)
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 3. Kullanıcıyı kontrol et (Bu çağrı session'ı yeniler)
  // DİKKAT: getUser() kullanıyoruz, getSession() değil (Güvenlik için)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- KORUMALI ROTA KONTROLÜ ---

  // A) Kullanıcı YOKSA ve /admin paneline girmeye çalışıyorsa -> Login'e at
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // B) Kullanıcı VARSA ve Login sayfasına girmeye çalışıyorsa -> Admin'e at
  if (user && request.nextUrl.pathname.startsWith("/admin/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // 4. Güncellenmiş response'u döndür
  return response;
}