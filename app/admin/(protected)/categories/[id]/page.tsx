// app\admin\(protected)\categories\[id]\page.tsx
import { adminSupabase } from "@/lib/supabase/admin";
import CategoryForm from "./category-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryDetailPage(props: PageProps) {
  const params = await props.params;
  const isNew = params.id === "new";
  const categoryId = isNew ? null : parseInt(params.id);

  // Paralel Veri Çekme
  const allCatsQuery = adminSupabase.from("categories").select("id, name");

  const catQuery =
    !isNew && categoryId
      ? adminSupabase
          .from("categories")
          .select("*")
          .eq("id", categoryId)
          .single()
      : Promise.resolve({ data: null });

  const locQuery =
    !isNew && categoryId
      ? adminSupabase
          .from("category_translations")
          .select("*")
          .eq("category_id", categoryId)
      : Promise.resolve({ data: [] });

  const [allCatsRes, catRes, locRes] = await Promise.all([
    allCatsQuery,
    catQuery,
    locQuery,
  ]);

  return (
    <div className="grid gap-6">
      <h2
        className="text-2xl font-semibold"
        style={{ color: "var(--admin-fg)" }}
      >
        {isNew ? "Yeni Kategori" : `Kategori Düzenle #${categoryId}`}
      </h2>

      <CategoryForm
        isNew={isNew}
        categoryId={categoryId}
        initialData={catRes.data}
        allCategories={allCatsRes.data || []}
        initialLocalizations={locRes.data || []}
      />
    </div>
  );
}
