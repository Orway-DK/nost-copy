// app/admin/(protected)/settings/page.tsx
import { adminSupabase } from "@/lib/supabase/admin";
import SettingsForm from "./settings-form"; // DÜZELTME: .tsx uzantısı kaldırıldı

// Cache İptali
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // 1. Ayarları Çek
  const { data: settings } = await adminSupabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  // 2. Forma Gönder
  return (
    <SettingsForm 
      initialData={settings || {}} 
    />
  );
}