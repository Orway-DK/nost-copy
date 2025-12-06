import { adminSupabase } from "@/lib/supabase/admin";
import LandingPageClient from "./landing-page-client";

export const dynamic = "force-dynamic";

export default async function LandingAdminPage() {
    // Paralel veri çekme
    const slidesQuery = adminSupabase
        .from("landing_slides")
        .select(`*, landing_slide_translations (*)`)
        .order("order_no", { ascending: true });

    const highlightsQuery = adminSupabase
        .from("landing_highlights")
        .select(`*, landing_highlight_translations (*)`)
        .order("order_no", { ascending: true });

    const [slidesRes, hlRes] = await Promise.all([slidesQuery, highlightsQuery]);

    return (
        <LandingPageClient
            initialSlides={slidesRes.data || []}
            initialHighlights={hlRes.data || []}
        />
    );
}