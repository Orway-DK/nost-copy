// middleware.ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Tüm işlem lib/supabase/middleware.ts içinde yapılıyor
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aşağıdaki yollar hariç tüm isteklerde çalışır:
     * - _next/static (statik dosyalar)
     * - _next/image (resim optimizasyonu)
     * - favicon.ico (ikon)
     * - .svg, .png, .jpg vb. (resim dosyaları)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};