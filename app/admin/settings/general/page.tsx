// @/app/admin/settings/general/page.tsx
import GeneralForm from "./_components/GeneralForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin • Settings • General" };

export default async function GeneralSettingsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: settings, error } = await supabase
    .from("site_settings")
    .select(
      `
      site_name,
      logo_url,
      favicon_url,
      phone,
      email,
      address,
      store_location_url,
      facebook_url,
      instagram_url,
      twitter_url,
      linkedin_url,
      whatsapp_url,
      working_hours,
      footer_text
    `
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("site_settings fetch error:", error.message);
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">General Settings</h1>
      <GeneralForm initialSettings={settings ?? null} />
    </>
  );
}
