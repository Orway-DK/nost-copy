import TopbandForm from "./_components/TopBandForm";
import { readDB, type Language } from "@/lib/db";

export const metadata = { title: "Admin • Settings • Top Band" };

export default async function TopbandSettingsPage() {
  const db = await readDB();

  let languages: Language[] =
    db.languages ??
    Array.from(new Set((db.banners ?? []).map(b => b.lang_code))).map((code, idx) => ({
      code,
      name: code.toUpperCase(),
      is_default: idx === 0
    }));

  // İsteğe bağlı: default dil en başta gelsin
  languages = [...languages].sort((a, b) => Number(b.is_default) - Number(a.is_default));

  const banners = db.banners ?? [];

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Top Band / Banner</h1>
      <TopbandForm languages={languages} initialBanners={banners} />
    </>
  );
}
