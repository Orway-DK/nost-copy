// app/_components/NavigationBar/types.ts

export type ProductPreview = {
  id: number;
  slug: string;
  name: string;
  image_url: string | null;
  price?: number;
};

export type NavItem = {
  id: number;
  label: string;
  href: string;
  image_path?: string | null;
  children?: NavItem[];
  previewProducts?: ProductPreview[];
  allPreviewProducts?: ProductPreview[];
};

export type TranslationDictionary = {
  searchPlaceholder: string;
  login: string;
  cart: string;
  allProducts: string;
  popular?: string;
};
