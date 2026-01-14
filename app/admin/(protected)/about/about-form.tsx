// app\admin\(protected)\about\about-form.tsx
"use client";

import { useState } from "react";
import { IoSave, IoSparkles } from "react-icons/io5";
import { toast } from "react-hot-toast";
import { updateAboutContentAction } from "./actions";
import { translateTextAction } from "@/app/admin/actions";
import TextareaAutoResize from "@/components/TextareaAutoResize";

const LANGS = ["tr", "en", "de"];

type FormDataValue = {
  tr?: string;
  en?: string;
  de?: string;
  [key: string]: string | undefined;
};

type Props = {
  initialData: Record<string, FormDataValue>;
};

const FIELD_GROUPS = [
  {
    id: "hero",
    title: "Hero (Üst Alan)",
    fields: [
      { key: "hero_title", label: "Başlık" },
      { key: "hero_subtitle", label: "Alt Başlık" },
    ],
  },
  {
    id: "team",
    title: "Sol Kutu (Ekip)",
    fields: [
      { key: "grid_title", label: "Başlık" },
      { key: "grid_role", label: "Rol / Açıklama" },
    ],
  },
  {
    id: "stats",
    title: "İstatistikler",
    fields: [
      { key: "stat_1_val", label: "Değer 1" },
      { key: "stat_1_label", label: "Etiket 1" },
      { key: "stat_2_val", label: "Değer 2" },
      { key: "stat_2_label", label: "Etiket 2" },
      { key: "stat_3_val", label: "Değer 3" },
      { key: "stat_3_label", label: "Etiket 3" },
    ],
  },
  {
    id: "bio",
    title: "Biyografi (Orta)",
    fields: [
      { key: "bio_title", label: "Başlık" },
      { key: "bio_text", label: "Metin", type: "textarea" },
    ],
  },
  {
    id: "intro",
    title: "Tanıtım & Alıntı (Sağ)",
    fields: [
      { key: "intro_text", label: "Tanıtım Metni", type: "textarea" },
      { key: "quote_text", label: "Alıntı Sözü", type: "textarea" },
      { key: "quote_author", label: "Alıntı Sahibi" },
    ],
  },
  {
    id: "footer",
    title: "Footer (Alt Kısım)",
    fields: [
      { key: "footer_title", label: "Başlık" },
      { key: "footer_text", label: "Metin", type: "textarea" },
    ],
  },
];

export default function AboutForm({ initialData }: Props) {
  const [formData, setFormData] = useState(initialData);
  const [activeLang, setActiveLang] = useState("tr");
  const [activeTab, setActiveTab] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  const handleChange = (key: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [activeLang]: val,
      },
    }));
  };

  const handleAutoTranslate = async () => {
    if (
      !confirm(
        "Türkçe dışındaki alanlar otomatik çevrilecek. Onaylıyor musunuz?"
      )
    )
      return;

    setTranslating(true);
    const loadingToast = toast.loading("Çeviriliyor...");

    try {
      const newFormData = JSON.parse(JSON.stringify(formData));
      const targetLangs = LANGS.filter((l) => l !== "tr");

      const tasks: Promise<void>[] = [];

      for (const key of Object.keys(newFormData)) {
        const sourceText = newFormData[key]?.["tr"]; // Null check eklendi
        if (!sourceText) continue;

        for (const targetLang of targetLangs) {
          tasks.push(
            translateTextAction(sourceText, targetLang, "tr").then((res) => {
              if (res.success) {
                if (!newFormData[key]) newFormData[key] = {};
                newFormData[key][targetLang] = res.text;
              }
            })
          );
        }
      }

      await Promise.all(tasks);
      setFormData(newFormData);
      toast.success("Çeviri tamamlandı!", { id: loadingToast });
    } catch (e) {
      toast.error("Çeviri sırasında hata oluştu.", { id: loadingToast });
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateAboutContentAction(formData);
    setSaving(false);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const activeGroup = FIELD_GROUPS.find((group) => group.id === activeTab);

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      {/* Sticky Toolbar - Minimalist */}
      <div className="sticky top-0 z-20 bg-[var(--admin-card)] p-4 rounded-xl border border-[var(--admin-card-border)] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 backdrop-blur-sm bg-opacity-95 mb-6">
        {/* Dil Seçimi - Daha minimalist */}
        <div className="flex gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLang(l)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase transition-all whitespace-nowrap ${
                activeLang === l
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                  : "bg-transparent text-[var(--admin-muted)] hover:text-[var(--admin-fg)] border border-[var(--admin-card-border)] hover:border-[var(--admin-input-border)]"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Aksiyonlar */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleAutoTranslate}
            disabled={translating}
            className="btn-admin btn-admin-secondary text-xs gap-2 flex-1 sm:flex-none justify-center min-w-[120px]"
          >
            <IoSparkles
              className={
                translating ? "animate-spin text-yellow-500" : "text-yellow-500"
              }
            />
            {translating ? "Çevriliyor..." : "Oto. Çevir"}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="btn-admin btn-admin-primary gap-2 px-4 flex-1 sm:flex-none justify-center min-w-[120px]"
          >
            <IoSave />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Ana İçerik - Tablar ve Form */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Sol: Tab Navigasyonu */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-[var(--admin-card)] rounded-lg border border-[var(--admin-card-border)] p-4">
            <h3 className="text-sm font-semibold text-[var(--admin-muted)] uppercase tracking-wider mb-3">
              İçerik Bölümleri
            </h3>
            <nav className="space-y-1">
              {FIELD_GROUPS.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveTab(group.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === group.id
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "text-[var(--admin-fg)] hover:bg-[var(--admin-input-bg)]"
                  }`}
                >
                  {group.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Sağ: Form Alanları */}
        <div className="flex-1 bg-[var(--admin-card)] rounded-lg border border-[var(--admin-card-border)] p-5 overflow-y-auto">
          {activeGroup && (
            <>
              <div className="mb-5 pb-3 border-b border-[var(--admin-card-border)]">
                <h2 className="text-lg font-bold text-[var(--admin-fg)]">
                  {activeGroup.title}
                </h2>
                <p className="text-[var(--admin-muted)] text-xs mt-1">
                  {activeLang.toUpperCase()} dilindeki içeriği düzenleyin
                </p>
              </div>

              <div className="space-y-4">
                {activeGroup.fields.map((field) => {
                  const val = formData[field.key]?.[activeLang] || "";

                  return (
                    <div key={field.key} className="space-y-1.5">
                      <label className="block text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wide">
                        {field.label}
                        <span className="ml-1 text-[10px] text-[var(--admin-muted)]">
                          ({activeLang.toUpperCase()})
                        </span>
                      </label>
                      {field.type === "textarea" ? (
                        <TextareaAutoResize
                          value={val}
                          onChange={(e) =>
                            handleChange(field.key, e.target.value)
                          }
                          placeholder={`${
                            field.label
                          } (${activeLang.toUpperCase()})`}
                          minRows={3}
                          className="text-sm"
                        />
                      ) : (
                        <input
                          className="admin-input w-full text-sm py-1.5"
                          value={val}
                          onChange={(e) =>
                            handleChange(field.key, e.target.value)
                          }
                          placeholder={`${
                            field.label
                          } (${activeLang.toUpperCase()})`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
