// app/_components/NavigationBar/types.ts

export interface NavItem {
  id: number
  parent_id: number | null
  label: string
  href: string
  image_path?: string | null
  children?: NavItem[]
  previewProducts?: ProductPreview[]
  allPreviewProducts?: ProductPreview[] // Aggregated products
}

export interface ProductPreview {
  id: number
  slug: string
  name: string
  image_url: string | null
  price: number
}

export interface TranslationDictionary {
  langCode: string // <-- Yeni eklenen alan
  searchPlaceholder: string
  login: string
  cart: string
  allProducts: string
}
