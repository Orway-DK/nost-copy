// C:\Projeler\nost-copy\types\index.ts

// --- 1. ŞABLON (CLASS) TİPLERİ ---
export type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'paper';

export interface TemplateField {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  is_variant?: boolean;
}

// Materyal Tipini de tanımlayalım (Frontend'de kullanmak için)
export interface Material {
  id: number;
  name: string;
  category_slug: string; // 'kagit'
  type_code: string;     // 'kuse', 'bristol'
  weight_g: number;
  finish_type: string;   // 'mat', 'parlak'
  is_active: boolean;
}

// ... Diğer tipler (ProductTemplate vb.) aynı kalır

export interface TemplateField {
  key: string // DB'de tutulacak key: "paper_type", "volume"
  label: string // Ekranda görünen: "Kağıt Türü", "Hacim"
  type: FieldType // Input tipi
  options?: string[] // Eğer select ise seçenekler: ["Mat", "Parlak"]
  required: boolean | undefined;
  suffix?: string // Birim eki: "ml", "gr", "cm"
}

export interface ProductTemplate {
  id: number
  name: string // "Kupa", "Kartvizit"
  schema: TemplateField[] // Form yapısı (JSONB)
  created_at?: string
}

// --- 2. ÜRÜN TİPLERİ ---
export interface Product {
  id: number
  template_id: number | null // Hangi şablona bağlı?
  sku: string | null
  name: string
  slug: string
  category_slug: string | null
  description: string | null
  active: boolean

  // Dinamik Özellikler (Ürünün GENEL özellikleri - Filtreleme için)
  attributes: Record<string, any>

  // İlişkiler
  product_media?: ProductMedia[]
  product_variants?: ProductVariant[]
  product_template?: ProductTemplate
}

// --- 3. VARYANT TİPLERİ ---
export interface ProductVariant {
  id: number
  product_id: number

  // Dinamik Özellikler (Varyantın ÖZEL kombinasyonu - Fiyatı belirleyenler)
  // Örn: { "adet": 1000, "kagit": "Mat Kuşe" }
  attributes: Record<string, any>

  // Fiyat (Sanal alan, product_prices tablosundan gelecek)
  price?: number
  currency?: string
}

export interface ProductMedia {
  id: number
  product_id: number
  image_key: string
  sort_order: number
}

// types.ts veya types/index.ts

export interface TemplateField {
  id: string; // <--- YENİ EKLENDİ (Unique ID)
  key: string;
  label: string;
  type: FieldType;
  required: boolean | undefined;
  options?: string[];
}

export interface ProductTemplate {
  id: number;
  name: string;
  schema: TemplateField[];
  created_at?: string;
}

