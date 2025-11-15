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
      const formData = new FormData(e.currentTarget);
      await upsertBannerTranslation(formData);
      setMsg("Banner çevirisi güncellendi.");
      router.refresh();
      (e.target as HTMLFormElement).reset(); // istersen formu temizlemezsin
    } catch (err: any) {
      setMsg(`Hata: ${err.message || err}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {languages.map((lang) => {
        const b = initialBanners.find((x) => x.lang_code === lang.code);
        return (
          <form
            key={lang.code}
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4"
          >
            <input type="hidden" name="lang_code" value={lang.code} />
            <Text
              className="md:col-span-2"
              name="promo_text"
              label={`[${lang.code}] Promo Text`}
              defaultValue={b?.promo_text || ""}
            />
            <Text
              name="promo_cta"
              label="CTA"
              defaultValue={b?.promo_cta || ""}
            />
            <Text
              name="promo_url"
              label="URL"
              defaultValue={b?.promo_url || ""}
            />
            <div className="md:col-span-2">
              <button
                disabled={pending}
                className="rounded bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {pending ? "Kaydediliyor..." : `Kaydet (${lang.name})`}
              </button>
            </div>
          </form>
        );
      })}
      {msg && <p className="text-sm">{msg}</p>}
    </div>
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
      <span className="block text-sm mb-1">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded border px-3 py-2 text-sm"
      />
    </label>
  );
}
