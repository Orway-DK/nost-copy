// app/admin/(protected)/profile/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Oturum yok.</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>Kullanıcı Ayarları</h2>
                <p className="text-sm" style={{ color: "var(--admin-muted)" }}>Profil bilgilerinizi ve şifrenizi güncelleyin.</p>
            </div>

            <ProfileForm user={user} />
        </div>
    );
}