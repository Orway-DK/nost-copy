// app/admin/settings/topband/actions.ts
"use server";

import { readBanners, writeBanners } from "@/lib/db";
import type { Banner } from "@/lib/dbTypes";

export async function upsertBannerTranslation(formData: FormData) {
  const lang_code = formData.get("lang_code")?.toString().trim() || "";
  const promo_text = formData.get("promo_text")?.toString() ?? "";
  const promo_cta = formData.get("promo_cta")?.toString() ?? "";
  const promo_urlV = formData.get("promo_url")?.toString().trim();
  const promo_url = promo_urlV ? promo_urlV : null; // type: string | null

  if (!lang_code) {
    throw new Error("lang_code zorunludur.");
  }

  const incoming: Banner = { lang_code, promo_text, promo_cta, promo_url };

  try {
    const { banners = [] } = await readBanners();

    const idx = banners.findIndex((b) => b.lang_code === lang_code);
    if (idx >= 0) {
      banners[idx] = { ...banners[idx], ...incoming };
    } else {
      banners.push(incoming);
    }

    await writeBanners({ banners });

    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
