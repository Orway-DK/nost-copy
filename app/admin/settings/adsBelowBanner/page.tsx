import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import AdsForm from "./_components/AdsForm";

export const metadata = { title: "Admin • Settings • Advertisements (Ads)" };

type Language = { code: string; name: string; is_default: boolean };

export type Ads = {
    id?: number;
    lang_code: string;
    text: string;
    icon: string;
    order_no?: number;
};

export default async function AdsSettingsPage() {
    const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Make sure the query selects id and order_no so UI can edit them
    const { data: adsData, error } = await supabase
        .from("ads_below_landing")
        .select(
            "id,lang_code,text,icon,order_no"
        )
        .order("order_no", { ascending: true })
        .order("lang_code", { ascending: true });

    if (error) {
        throw new Error("Supabase error: " + error.message);
    }

    const advers: Ads[] = (adsData ?? []).map((c: any, idx: number) => ({
        id: c.id,
        lang_code: c.lang_code,
        text: c.text ?? "",
        icon: c.icon ?? "",
        order_no: typeof c.order_no === "number" ? c.order_no : idx,
    }));

    let languages: Language[] =
        Array.from(new Set(advers.map((b) => b.lang_code))).map((code, idx) => ({
            code,
            name: code.toUpperCase(),
            is_default: idx === 0,
        }));

    languages = [...languages].sort((a, b) => Number(b.is_default) - Number(a.is_default));

    return (
        <>
            <AdsForm languages={languages} initialAds={advers} />
        </>
    );
}