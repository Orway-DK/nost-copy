// app/admin/(protected)/categories/page.tsx
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
    items.forEach(item => {
        map[item.id] = { ...item, children: [] };
    });

    // Sonra ebeveynlerine bağla
    items.forEach(item => {
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

    return (
        <div className="grid gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold" style={{ color: "var(--admin-fg)" }}>Kategoriler</h2>
                <Link
                    href="/admin/categories/new"
                    className="btn-admin btn-admin-primary flex items-center gap-2"
                >
                    <IoAdd size={18} /> Yeni Kategori
                </Link>
            </div>

            <CategoryList initialData={treeData} />
        </div>
    );
}