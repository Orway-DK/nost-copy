import TopbandForm from "./_components/TopBandForm";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const metadata = { title: "Admin • Settings • Top Band" };

type Language = { code: string; name: string; is_default: boolean };
type Banner = { lang_code: string; promo_text: string; promo_cta: string; promo_url: string | null };

export default async function TopbandSettingsPage() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: bannersData, error } = await supabase
    .from("banner_translations")
    .select("lang_code,promo_text,promo_cta,promo_url")
    .order("lang_code");

  const banners: Banner[] = bannersData ?? [];

  let languages: Language[] =
    Array.from(new Set(banners.map(b => b.lang_code))).map((code, idx) => ({
      code,
      name: code.toUpperCase(),
      is_default: idx === 0,
    }));

  languages = [...languages].sort((a, b) => Number(b.is_default) - Number(a.is_default));

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Top Band / Banner</h1>
      <TopbandForm languages={languages} initialBanners={banners} />
    </>
  );
}
