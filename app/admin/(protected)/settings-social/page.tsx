// app/admin/(protected)/social-settings/page.tsx
import { adminSupabase } from "@/lib/supabase/admin";
import SocialSettingsForm from "./social-settings-form";

// Cache'i devre dışı bırakalım ki her girişte güncel veri gelsin
export const dynamic = "force-dynamic";

export default async function SocialSettingsPage() {
    // 1. Önce Site Ayarları ID'sini bulalım (Parent kayıt)
    const { data: settings } = await adminSupabase
        .from("site_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

    let links: any[] = [];

    // 2. Eğer ayar kaydı varsa linkleri çekelim
    if (settings?.id) {
        const { data: linkData } = await adminSupabase
            .from("site_social_links")
            .select("*")
            .eq("settings_id", settings.id)
            .order("sort", { ascending: true }) // Sıralı getir
            .order("id", { ascending: true }); // Eşitlik durumunda ID'ye bak

        if (linkData) links = linkData;
    }

    return (
        <SocialSettingsForm
            initialLinks={links}
            settingsId={settings?.id || null}
        />
    );
}