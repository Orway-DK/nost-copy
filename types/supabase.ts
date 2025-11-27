// Örnek tip (isteğe bağlı). Supabase'den "Types > Generate" ile alıp düzenleyebilirsin.
// interface Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T];

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Örnek tablo tipi. Gerçek tablo şemanı buraya ekle.
      products: {
        Row: {
          id: number;
          slug: string;
          active: boolean;
          primary_category_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          active?: boolean;
          primary_category_id?: number | null;
        };
        Update: {
          slug?: string;
          active?: boolean;
          primary_category_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_primary_category_id_fkey";
            columns: ["primary_category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      media_kind: "MAIN" | "GALLERY" | "THUMB";
    };
  };
}
