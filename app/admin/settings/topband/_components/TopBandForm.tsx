// app/admin/settings/topband/_components/TopBandForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { upsertBannerTranslation } from "../actions";

type Lang = { code: string; name: string; is_default: boolean };
type Banner = {
  lang_code: string;
  promo_text: string;
  promo_cta: string;
  promo_url: string | null;
};

export default function TopbandForm({
  languages,
  initialBanners,
}: {
  languages: Lang[];
  initialBanners: Banner[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    try {
      const fullForm = new FormData(e.currentTarget);

      // Her dil için ayrı FormData oluşturup aynı server action'u çağırıyoruz.
      await Promise.all(
        languages.map(async (lang) => {
          const fd = new FormData();
          fd.append("lang_code", lang.code);
          fd.append(
            "promo_text",
            String(fullForm.get(`promo_text_${lang.code}`) || "")
          );
          fd.append(
            "promo_cta",
            String(fullForm.get(`promo_cta_${lang.code}`) || "")
          );
          fd.append(
            "promo_url",
            String(fullForm.get(`promo_url_${lang.code}`) || "")
          );
          await upsertBannerTranslation(fd);
        })
      );

      setMsg("Tüm banner çevirileri güncellendi.");
      router.refresh();
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      setMsg(`Hata: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-2">
        {languages.map((lang) => {
          const b = initialBanners.find((x) => x.lang_code === lang.code);
          return (
            <fieldset
              key={lang.code}
              className="border rounded-md p-4 space-y-2"
            >
              <legend className="px-2 text-sm font-medium">
                {lang.name} ({lang.code})
              </legend>
              <Text
                name={`promo_text_${lang.code}`}
                label="Promo Text"
                defaultValue={b?.promo_text || ""}
              />
              <Text
                name={`promo_cta_${lang.code}`}
                label="CTA"
                defaultValue={b?.promo_cta || ""}
              />
              <Text
                name={`promo_url_${lang.code}`}
                label="URL"
                defaultValue={b?.promo_url || ""}
              />
            </fieldset>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          disabled={pending}
          className="rounded bg-blue-600 text-white px-6 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Kaydediliyor..." : "Tümünü Kaydet"}
        </button>
      </div>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}

function Text(props: {
  name: string;
  label: string;
  defaultValue?: string;
  className?: string;
}) {
  const { name, label, defaultValue, className } = props;
  return (
    <label className={`block ${className || ""}`}>
      <span className="block text-xs mb-1 font-medium">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded border px-3 py-2 text-sm"
      />
    </label>
  );
}
