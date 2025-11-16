"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdsInput = {
  id?: number | null;
  lang_code: string;
  text?: string;
  icon?: string;
  order_no?: number;
};

export async function upsertAds(formData: FormData) {
  const itemsRaw = formData.get("items");
  if (!itemsRaw || typeof itemsRaw !== "string") {
    throw new Error("items (JSON string) is required in FormData");
  }

  let itemsInput: AdsInput[];
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
    text: String(it.text ?? ""),
    icon: String(it.icon ?? ""),
    order_no: typeof it.order_no === "number" ? it.order_no : idx,
    updated_by: user.id,
  }));

  const { data, error } = await supabase
    .from("ads_below_landing")
    .upsert(payload, { onConflict: "id" });

  if (error) throw new Error(error.message);

  return { ok: true, items: data };
}
