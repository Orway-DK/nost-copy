// C:\Projeler\nost-copy\app\admin\(protected)\categories\page.tsx
import { adminSupabase } from "@/lib/supabase/admin";
import CategoryList from "./category-list";
import Link from "next/link";
import { IoAdd } from "react-icons/io5";

export const dynamic = "force-dynamic";

// Helper: Düz listeyi ağaç yapısına çevir
function buildTree(items: any[]) {
  const map: Record<number, any> = {};
  const roots: any[] = [];

  // Önce hepsini map'e at ve children array'i ekle
  items.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });

  // Sonra ebeveynlerine bağla
  items.forEach((item) => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });

  return roots;
}

export default async function CategoriesPage() {
  const { data } = await adminSupabase
    .from("categories")
    .select("*")
    .order("sort", { ascending: true })
    .order("id", { ascending: true });

  const treeData = buildTree(data || []);

  // Tüm kategorileri flat list olarak da al (form için)
  const { data: allCategories } = await adminSupabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <div className="grid gap-2">
      <CategoryList
        initialData={treeData}
        allCategories={allCategories || []}
      />
    </div>
  );
}
