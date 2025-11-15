// @/app/admin/settings/general/_components/GeneralForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettings } from "../actions";

type Settings = {
  site_name: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  store_location_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  whatsapp_url: string | null;
  working_hours: string | null;
  footer_text: string | null;
} | null;

export default function GeneralForm({
  initialSettings,
}: {
  initialSettings: Settings;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const s = initialSettings || ({} as any);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    try {
      const formData = new FormData(e.currentTarget);
      await updateSiteSettings(formData);
      setMsg("General settings güncellendi.");
      router.refresh();
    } catch (err: any) {
      setMsg(`Hata: ${err.message || err}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Text
        name="site_name"
        label="Site Name"
        defaultValue={s.site_name || ""}
        required
      />
      <Text name="logo_url" label="Logo URL" defaultValue={s.logo_url || ""} />
      <Text
        name="favicon_url"
        label="Favicon URL"
        defaultValue={s.favicon_url || ""}
      />
      <Text name="phone" label="Phone" defaultValue={s.phone || ""} />
      <Text name="email" label="Email" defaultValue={s.email || ""} />
      <Text name="address" label="Address" defaultValue={s.address || ""} />
      <Text
        name="store_location_url"
        label="Store Location URL"
        defaultValue={s.store_location_url || ""}
      />
      <Text
        name="facebook_url"
        label="Facebook URL"
        defaultValue={s.facebook_url || ""}
      />
      <Text
        name="instagram_url"
        label="Instagram URL"
        defaultValue={s.instagram_url || ""}
      />
      <Text
        name="twitter_url"
        label="Twitter URL"
        defaultValue={s.twitter_url || ""}
      />
      <Text
        name="linkedin_url"
        label="LinkedIn URL"
        defaultValue={s.linkedin_url || ""}
      />
      <Text
        name="whatsapp_url"
        label="WhatsApp URL"
        defaultValue={s.whatsapp_url || ""}
      />
      <Text
        name="working_hours"
        label="Working Hours"
        defaultValue={s.working_hours || ""}
      />
      <Textarea
        className="md:col-span-2"
        name="footer_text"
        label="Footer Text"
        defaultValue={s.footer_text || ""}
      />

      <div className="md:col-span-2 flex items-center gap-3">
        <button
          disabled={pending}
          className="rounded bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </form>
  );
}

function Text(props: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
}) {
  const { name, label, defaultValue, required, className } = props;
  return (
    <label className={`block ${className || ""}`}>
      <span className="block text-sm mb-1">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded border px-3 py-2 text-sm"
      />
    </label>
  );
}
function Textarea(props: {
  name: string;
  label: string;
  defaultValue?: string;
  className?: string;
}) {
  const { name, label, defaultValue, className } = props;
  return (
    <label className={`block ${className || ""}`}>
      <span className="block text-sm mb-1">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={4}
        className="w-full rounded border px-3 py-2 text-sm"
      />
    </label>
  );
}
