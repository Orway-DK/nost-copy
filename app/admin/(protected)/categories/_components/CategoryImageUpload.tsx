// app/admin/(protected)/categories/_components/CategoryImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IoCloudUpload, IoTrash, IoImage } from "react-icons/io5";
import Image from "next/image";

interface CategoryImageUploadProps {
  currentPath: string | null;
  altText: string | null;
  onImageChange: (path: string | null) => void;
  onAltTextChange: (text: string) => void;
}

// Dosya ismini temizleyen ve SEO uyumlu hale getiren yardımcı fonksiyon
const sanitizeFileName = (name: string) => {
  const trMap: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "C",
    Ğ: "G",
    İ: "I",
    Ö: "O",
    Ş: "S",
    Ü: "U",
  };

  return name
    .split("")
    .map((char) => trMap[char] || char) // Türkçe karakterleri değiştir
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-") // Harf ve rakam dışındakileri tire yap
    .replace(/-+/g, "-") // Çift tireleri teke indir
    .replace(/^-|-$/g, ""); // Baştaki ve sondaki tireleri sil
};

export default function CategoryImageUpload({
  currentPath,
  altText,
  onImageChange,
  onAltTextChange,
}: CategoryImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseBrowserClient();

  // Görselin tam URL'ini oluştur
  const getImageUrl = (path: string) => {
    if (!path) return null;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/categories/${path}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const originalNameWithoutExt = file.name.substring(
      0,
      file.name.lastIndexOf(".")
    );
    // 1. İsim Temizleme (SEO İçin)
    const cleanName = sanitizeFileName(originalNameWithoutExt);

    // 2. Benzersizlik (Overwrite olmasın diye sonuna kısa bir timestamp)
    // Örnek Çıktı: kartvizit-baski-17354921.jpg
    const uniqueId = Date.now().toString().slice(-6);
    const finalFileName = `${cleanName}-${uniqueId}.${fileExt}`;

    setUploading(true);

    try {
      // Eski görseli sil (Storage temizliği için)
      if (currentPath) {
        await supabase.storage.from("categories").remove([currentPath]);
      }

      // Yeni görseli SEO uyumlu isimle yükle
      const { error: uploadError } = await supabase.storage
        .from("categories")
        .upload(finalFileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Parent'a yeni path'i bildir
      onImageChange(finalFileName);

      // Eğer Alt Text boşsa, dosya isminden otomatik üret (Tireleri boşluk yapıp baş harfleri büyüt)
      if (!altText) {
        const autoAlt = cleanName
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        onAltTextChange(autoAlt);
      }
    } catch (error: any) {
      alert("Görsel yüklenirken hata oluştu: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentPath) return;
    if (!confirm("Görseli kaldırmak istediğinize emin misiniz?")) return;

    setUploading(true);
    try {
      await supabase.storage.from("categories").remove([currentPath]);
      onImageChange(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      alert("Görsel silinirken hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  const imageUrl = currentPath ? getImageUrl(currentPath) : null;

  return (
    <div className="space-y-3 border p-4 rounded bg-[var(--admin-card)] border-[var(--admin-card-border)]">
      <div className="flex items-start gap-4">
        {/* Önizleme Alanı */}
        <div className="relative w-24 h-24 shrink-0 bg-[var(--admin-input-bg)] rounded border border-[var(--admin-input-border)] flex items-center justify-center overflow-hidden">
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--admin-accent)]"></div>
          ) : imageUrl ? (
            <Image src={imageUrl} alt="Preview" fill className="object-cover" />
          ) : (
            <IoImage className="text-4xl text-[var(--admin-muted)] opacity-30" />
          )}
        </div>

        {/* Butonlar ve Alt Text */}
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="btn-admin btn-admin-secondary text-xs px-3 py-2 flex items-center gap-2"
            >
              <IoCloudUpload /> {imageUrl ? "Değiştir" : "Görsel Yükle"}
            </button>

            {imageUrl && (
              <button
                type="button"
                disabled={uploading}
                onClick={handleRemoveImage}
                className="btn-admin btn-admin-danger text-xs px-3 py-2"
              >
                <IoTrash />
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[var(--admin-muted)]">
              SEO Açıklaması (Alt Text)
            </label>
            <input
              type="text"
              value={altText || ""}
              onChange={(e) => onAltTextChange(e.target.value)}
              placeholder="Örn: Siyah Lüks Kartvizit"
              className="admin-input text-xs py-1"
            />
          </div>
        </div>
      </div>
      <p className="text-[10px] text-[var(--admin-muted)] opacity-70">
        * Görsel isminiz otomatik olarak SEO uyumlu hale getirilecektir.
      </p>
    </div>
  );
}
