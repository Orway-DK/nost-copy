import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import TemplateManager from "./template-manager";
import { ProductTemplate } from "@/types";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const supabase = await createSupabaseServerClient();

  // Tüm şablonları çek
  const { data: templates, error } = await supabase
    .from("product_templates")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return <div>Hata: {error.message}</div>;
  }

  return <TemplateManager templates={(templates as ProductTemplate[]) || []} />;
}