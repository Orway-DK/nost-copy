// C:\Projeler\nost-copy\types\index.ts

// --- 1. ŞABLON VE MATERYAL TİPLERİ ---
export type FieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "textarea"
  | "paper";

// (Düzeltme: TemplateField 3 kere tanımlanmıştı, hepsini tek bir yerde birleştirdim)
export interface TemplateField {
  id: string; // Unique ID (UUID)
  key: string; // DB Key: "paper_type"
  label: string; // Görünen: "Kağıt Türü"
  type: FieldType; // Input tipi
  required: boolean;
  options?: string[]; // Select ise seçenekler
  is_variant?: boolean; // Varyant oluşturur mu?
  suffix?: string; // Birim eki: "gr", "cm"
}

export interface ProductTemplate {
  id: number;
  name: string; // "Kupa", "Kartvizit"
  schema: TemplateField[]; // Form yapısı (JSONB)
  created_at?: string;
}

export interface Material {
  id: number;
  name: string;
  category_slug: string; // 'kagit'
  type_code: string; // 'kuse', 'bristol'
  weight_g: number;
  finish_type: string; // 'mat', 'parlak'
  is_active: boolean;
}

// --- 2. KATEGORİ TİPLERİ (YENİ EKLENDİ) ---
export interface CategoryTranslation {
  lang_code: string;
  name: string;
  description?: string | null;
}

export interface Category {
  id: number;
  parent_id: number | null;
  name: string; // Varsayılan isim
  slug: string;
  active: boolean;
  sort?: number;

  // YENİ EKLENEN GÖRSEL ALANLARI
  image_path?: string | null; // "kartvizit.jpg"
  image_alt_text?: string | null; // "Siyah lüks kartvizit"

  // İlişkiler
  category_translations?: CategoryTranslation[];
  children?: Category[]; // Ağaç yapısı için
}

// --- 3. ÜRÜN TİPLERİ ---
export interface Product {
  id: number;
  template_id: number | null;
  sku: string | null;
  name: string;
  slug: string;
  category_slug: string | null;
  description: string | null;
  active: boolean;

  // Dinamik Özellikler
  attributes: Record<string, any>;

  // İlişkiler
  product_media?: ProductMedia[];
  product_variants?: ProductVariant[];
  product_template?: ProductTemplate;
  product_localizations?: {
    lang_code: string;
    name: string;
    description?: string | null;
  }[];
}

// --- 4. VARYANT VE MEDYA TİPLERİ ---
export interface ProductVariant {
  id: number;
  product_id: number;
  // Örn: { "adet": 1000, "kagit": "Mat Kuşe" }
  attributes: Record<string, any>;

  // Fiyatlar (product_prices tablosundan join ile gelirse)
  product_prices?: {
    amount: number;
    currency: string;
  }[];

  // Frontend'de hesaplanan tekil fiyat
  price?: number;
  currency?: string;
}

export interface ProductMedia {
  id: number;
  product_id: number;
  image_key: string;
  sort_order: number;
}
