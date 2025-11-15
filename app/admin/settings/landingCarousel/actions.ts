"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CarouselInput = {
  id?: number | null;
  lang_code: string;
  title1?: string;
  title2?: string;
  image_link?: string;
  sub_text?: string;
  tips?: string[] | string;
  button_link?: string;
  order_no?: number;
};

function normalizeTips(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // fallback to comma separated
      return v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export async function upsertCarousels(formData: FormData) {
  const itemsRaw = formData.get("items");
  if (!itemsRaw || typeof itemsRaw !== "string") {
    throw new Error("items (JSON string) is required in FormData");
  }

  let itemsInput: CarouselInput[];
  try {
    itemsInput = JSON.parse(itemsRaw);
    if (!Array.isArray(itemsInput)) throw new Error("items must be an array");
  } catch (err) {
    throw new Error(
      "Invalid items JSON: " +
        (err instanceof Error ? err.message : String(err))
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: uerr,
  } = await supabase.auth.getUser();
  if (uerr || !user) throw new Error("Oturum bulunamadı.");

  const payload = itemsInput.map((it, idx) => ({
    id: it.id ?? undefined,
    lang_code: String(it.lang_code ?? ""),
    title1: String(it.title1 ?? ""),
    title2: String(it.title2 ?? ""),
    image_link: String(it.image_link ?? ""),
    sub_text: String(it.sub_text ?? ""),
    tips: normalizeTips(it.tips),
    button_link: String(it.button_link ?? ""),
    order_no: typeof it.order_no === "number" ? it.order_no : idx,
    updated_by: user.id,
  }));

  const { data, error } = await supabase
    .from("landing_carousel")
    .upsert(payload, { onConflict: "id" });

  if (error) throw new Error(error.message);

  return { ok: true, items: data };
}
