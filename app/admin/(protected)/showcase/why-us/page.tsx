// app/admin/(protected)/why-us/page.tsx
import { adminSupabase } from "@/lib/supabase/admin";
import WhyUsForm from "./why-us-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WhyUsPage() {
    const { data: baseData, error: baseError } = await adminSupabase
        .from("why_us")
        .select("*")
        .limit(1)
        .maybeSingle();

    if (baseError) console.error("Base Data Error:", baseError);

    let translations: any[] = [];

    if (baseData?.id) {
        const { data: transData, error: transError } = await adminSupabase
            .from("why_us_translations")
            .select("*")
            .eq("why_us_id", baseData.id);

        if (transError) console.error("Trans Error:", transError);
        if (transData) translations = transData;

    }

    return (
        <WhyUsForm
            initialBase={baseData || {}}
            initialTranslations={translations}
        />
    );
}