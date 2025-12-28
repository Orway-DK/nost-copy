"use client";

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { SlPlus, SlTrash, SlRefresh, SlMenu, SlLink } from "react-icons/sl";
import { translateTextAction } from "@/app/admin/actions";
import { LangCode } from "../page";
import { SettingsHandle } from "./CategorySettings";

const SECTIONS = [
  { key: "information", label: "Information (Sol)" },
  { key: "useful", label: "Useful Links (Orta)" },
  { key: "about", label: "About Us (Sağ)" },
];

type FooterLink = {
  id: string;
  section: string;
  url: string;
  sort_order: number;
  active: boolean;
  titles: Record<LangCode, string>;
};

export const FooterSettings = forwardRef<SettingsHandle, { lang: LangCode }>(
  ({ lang }, ref) => {
    const supabase = createSupabaseBrowserClient();
    const [links, setLinks] = useState<FooterLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [translating, setTranslating] = useState(false);

    useEffect(() => {
      const load = async () => {
        // setLoading(true)
        const { data: rawLinks } = await supabase
          .from("footer_links")
          .select("*")
          .order("sort_order", { ascending: true });
        if (rawLinks) {
          const { data: translations } = await supabase
            .from("footer_links_translations")
            .select("*");
          const merged = rawLinks.map((l: any) => {
            const tMap: any = { tr: "", en: "", de: "" };
            translations
              ?.filter((t: any) => t.link_id === l.id)
              .forEach((t: any) => (tMap[t.lang_code] = t.title || ""));
            if (!tMap.tr && l.title) tMap.tr = l.title;
            if (!tMap.en && l.title) tMap.en = l.title;
            return { ...l, id: l.id.toString(), titles: tMap };
          });
          setLinks(merged);
        }
        setLoading(false);
      };
      load();
    }, []);

    useImperativeHandle(ref, () => ({
      save: async () => {
        try {
          const globalUpserts = links.map((l) => ({
            id: l.id.startsWith("temp-") ? undefined : parseInt(l.id),
            section: l.section,
            title: l.titles.tr || l.titles.en,
            url: l.url,
            sort_order: l.sort_order,
            active: l.active,
          }));
          const { data: savedLinks, error: linkError } = await supabase
            .from("footer_links")
            .upsert(globalUpserts)
            .select();
          if (linkError) throw linkError;
          const translationUpserts: any[] = [];
          savedLinks.forEach((saved) => {
            const original = links.find(
              (l) =>
                l.section === saved.section &&
                l.sort_order === saved.sort_order &&
                l.url === saved.url
            );
            if (original) {
              (["tr", "en", "de"] as LangCode[]).forEach((l) => {
                const title = original.titles[l];
                if (title)
                  translationUpserts.push({
                    link_id: saved.id,
                    lang_code: l,
                    title: title,
                  });
              });
            }
          });
          await supabase
            .from("footer_links_translations")
            .upsert(translationUpserts, { onConflict: "link_id, lang_code" });
          return true;
        } catch (e: any) {
          console.error(e);
          return false;
        }
      },
    }));

    const handleAdd = (section: string) => {
      const sectionLinks = links.filter((l) => l.section === section);
      const newSort =
        sectionLinks.length > 0
          ? Math.max(...sectionLinks.map((l) => l.sort_order)) + 1
          : 0;
      setLinks([
        ...links,
        {
          id: `temp-${Date.now()}`,
          section,
          url: "/",
          sort_order: newSort,
          active: true,
          titles: { tr: "", en: "", de: "" },
        },
      ]);
    };

    const handleDelete = async (id: string) => {
      if (!id.startsWith("temp-"))
        await supabase.from("footer_links").delete().eq("id", id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    };

    const handleDistribute = async () => {
      if (
        !confirm(
          "Tüm link başlıklarını seçili dilden diğerlerine çevirmek istiyor musunuz?"
        )
      )
        return;
      setTranslating(true);
      const toastId = toast.loading("Çevriliyor...");
      const updatedLinks = await Promise.all(
        links.map(async (link) => {
          const src = link.titles[lang];
          if (!src) return link;
          const newTitles = { ...link.titles };
          for (const l of ["tr", "en", "de"] as const) {
            if (l !== lang) {
              const res = await translateTextAction(src, l, lang);
              newTitles[l] = res.success ? res.text : src;
            }
          }
          return { ...link, titles: newTitles };
        })
      );
      setLinks(updatedLinks);
      setTranslating(false);
      toast.success("Bitti", { id: toastId });
    };

    if (loading)
      return <div className="p-4 text-center opacity-50">Yükleniyor...</div>;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4 bg-[var(--admin-card)] p-4 rounded-xl border border-[var(--admin-card-border)] shadow-sm">
          <div className="flex items-center gap-2">
            <span className="badge-admin badge-admin-default text-lg px-3">
              {lang.toUpperCase()}
            </span>
            <span className="text-sm text-admin-muted">Düzenleme Modu</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDistribute}
              disabled={translating}
              className="btn-admin btn-admin-secondary text-xs px-4 gap-2"
            >
              <SlRefresh className={translating ? "animate-spin" : ""} /> Çevir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {SECTIONS.map((sec) => (
            <div
              key={sec.key}
              className="card-admin h-full flex flex-col border border-[var(--admin-card-border)]"
            >
              <h3 className="font-bold border-b border-[var(--admin-card-border)] pb-2 mb-3 text-[var(--admin-fg)]">
                {sec.label}
              </h3>
              <div className="flex-1 space-y-2">
                {links
                  .filter((l) => l.section === sec.key)
                  .map((link) => (
                    <div
                      key={link.id}
                      className="bg-[var(--admin-input-bg)] p-3 rounded-lg border border-transparent hover:border-[var(--admin-card-border)] transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <SlMenu className="text-[var(--admin-muted)] cursor-grab" />
                        <input
                          className="flex-1 bg-transparent font-semibold text-sm text-[var(--admin-fg)] focus:outline-none border-b border-transparent focus:border-[var(--admin-accent)]"
                          placeholder={`Başlık (${lang})`}
                          value={link.titles[lang] || ""}
                          onChange={(e) =>
                            setLinks((prev) =>
                              prev.map((l) =>
                                l.id === link.id
                                  ? {
                                      ...l,
                                      titles: {
                                        ...l.titles,
                                        [lang]: e.target.value,
                                      },
                                    }
                                  : l
                              )
                            )
                          }
                        />
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={link.active}
                            onChange={(e) =>
                              setLinks((prev) =>
                                prev.map((l) =>
                                  l.id === link.id
                                    ? { ...l, active: e.target.checked }
                                    : l
                                )
                              )
                            }
                          />
                          <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--admin-success)]"></div>
                        </label>
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="text-[var(--admin-muted)] hover:text-[var(--admin-danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <SlTrash size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 pl-6">
                        <SlLink
                          size={10}
                          className="text-[var(--admin-muted)]"
                        />
                        <input
                          className="w-full text-xs font-mono text-[var(--admin-muted)] bg-transparent focus:text-[var(--admin-fg)] focus:outline-none"
                          placeholder="/url"
                          value={link.url}
                          onChange={(e) =>
                            setLinks((prev) =>
                              prev.map((l) =>
                                l.id === link.id
                                  ? { ...l, url: e.target.value }
                                  : l
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
              </div>
              <button
                onClick={() => handleAdd(sec.key)}
                className="btn-admin btn-admin-secondary w-full mt-4 border-dashed justify-center text-xs py-2"
              >
                <SlPlus /> Ekle
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

FooterSettings.displayName = "FooterSettings";
