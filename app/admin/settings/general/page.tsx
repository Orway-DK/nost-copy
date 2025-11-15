// @/app/admin/settings/general/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import GeneralForm from "./_components/GeneralForm";

export const metadata = { title: "Admin • Settings • General" };

export default async function GeneralSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const settings = data || {
    site_name: null, logo_url: null, favicon_url: null, phone: null, email: null,
    address: null, store_location_url: null, facebook_url: null, twitter_url: null,
    instagram_url: null, youtube_url: null, linkedin_url: null, meta_title: null,
    meta_description: null, meta_keywords: null, footer_text: null
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Genel Ayarlar</h1>
      <GeneralForm initialSettings={settings} />
    </>
  );
}
