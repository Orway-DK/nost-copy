import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cookies } from "next/headers";

type Props = {
  params: Promise<{ slug: string }>;
};

// --- YARDIMCI FONKSİYON: Dil Seçici ---
function getTranslation(translations: any[], lang: string) {
  if (!translations || translations.length === 0) return null;

  return (
    translations.find((t) => t.lang_code === lang) || // 1. Tercih: Seçili Dil
    translations.find((t) => t.lang_code === "en") || // 2. Tercih: İngilizce
    translations.find((t) => t.lang_code === "tr") || // 3. Tercih: Türkçe
    translations[0] // 4. Hiçbiri yoksa ilki
  );
}

// Metadata Oluşturma
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const langVal = cookieStore.get("lang")?.value;
  const lang = (langVal === "en" || langVal === "de") ? langVal : "tr";

  const supabase = await createSupabaseServerClient();

  // DİKKAT: Dil filtresi yok, hepsini çekiyoruz
  const { data } = await supabase
    .from("services")
    .select("service_translations(title, description, lang_code)")
    .eq("slug", slug)
    .single();

  // Eğer data veya translations yoksa boş dizi [] gönder
  const t = getTranslation(data?.service_translations || [], lang);

  if (!t) return { title: "Service Not Found" };

  return {
    title: `${t.title} - Nost Copy`,
    description: t.description,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const langVal = cookieStore.get("lang")?.value;
  const lang = (langVal === "en" || langVal === "de") ? langVal : "tr";

  const supabase = await createSupabaseServerClient();

  // 1. Tüm dilleri çek
  const { data: service, error } = await supabase
    .from("services")
    .select(`
      id, 
      image_url,
      service_translations (
        title,
        description,
        content,
        lang_code
      )
    `)
    .eq("slug", slug)
    .eq("active", true)
    .single();

  // Hizmet kökten yoksa 404
  if (error || !service) {
    notFound();
  }

  // 2. Uygun çeviriyi seç (Fallback'li)
  const t = getTranslation(service.service_translations, lang);

  if (!t) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-10 pb-20">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg mb-10 bg-gray-200">
          {service.image_url ? (
            <Image
              src={service.image_url}
              alt={t.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Görsel Yok
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white text-center px-4 drop-shadow-md">
              {t.title}
            </h1>
          </div>
        </div>

        {/* İçerik */}
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100">

          {/* Dil uyarısı (Opsiyonel) */}
          {t.lang_code !== lang && (
            <div className="mb-6 p-3 bg-yellow-50 text-yellow-700 text-sm rounded border border-yellow-200">
              ⚠️ Bu içerik seçtiğiniz dilde mevcut olmadığı için varsayılan dilde ({t.lang_code.toUpperCase()}) gösteriliyor.
            </div>
          )}

          <p className="text-xl text-gray-600 font-medium mb-8 border-l-4 border-blue-500 pl-4 italic">
            {t.description}
          </p>

          <div
            className="prose prose-lg prose-blue max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: t.content || "" }}
          />
        </div>
      </div>
    </div>
  );
}