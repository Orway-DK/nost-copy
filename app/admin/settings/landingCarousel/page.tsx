import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import CarouselForm from "./_components/CarouselForm.tsx";

export const metadata = { title: "Admin • Settings • Carousel" };

type Language = { code: string; name: string; is_default: boolean };
export type Carousel = {
    id?: number;
    lang_code: string;
    title1: string;
    title2: string;
    image_link: string;
    sub_text: string;
    tips: string[]; // supabase returns array
    button_link: string;
    order_no?: number;
};

export default async function TopbandSettingsPage() {
    const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Make sure the query selects id and order_no so UI can edit them
    const { data: carouselData, error } = await supabase
        .from("landing_carousel")
        .select(
            "id,lang_code,title1,title2,image_link,sub_text,tips,button_link,order_no"
        )
        .order("order_no", { ascending: true })
        .order("lang_code", { ascending: true });

    if (error) {
        // you can improve error handling / show in UI; for now throw so page shows failure
        throw new Error("Supabase error: " + error.message);
    }

    const carousels: Carousel[] = (carouselData ?? []).map((c: any, idx: number) => ({
        id: c.id,
        lang_code: c.lang_code,
        title1: c.title1 ?? "",
        title2: c.title2 ?? "",
        image_link: c.image_link ?? "",
        sub_text: c.sub_text ?? "",
        tips: Array.isArray(c.tips) ? c.tips : (c.tips ? [c.tips] : []),
        button_link: c.button_link ?? "",
        order_no: typeof c.order_no === "number" ? c.order_no : idx,
    }));

    let languages: Language[] =
        Array.from(new Set(carousels.map((b) => b.lang_code))).map((code, idx) => ({
            code,
            name: code.toUpperCase(),
            is_default: idx === 0,
        }));

    languages = [...languages].sort((a, b) => Number(b.is_default) - Number(a.is_default));

    return (
        <>
            <CarouselForm languages={languages} initialBanners={carousels} />
        </>
    );
}